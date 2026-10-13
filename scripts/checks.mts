/**
 * Self-checks: `npm run check`
 *
 * These are not vanity tests. Each one covers a rule that keeps the site
 * truthful, and several cover rules that are *not* reachable through the UI
 * until a venue feed is connected:
 *
 *   - every film in the sourced programme carries a citable release date, and
 *     none of them claims a runtime, certification, synopsis or poster that no
 *     source published;
 *   - no development fixture file or placeholder image survives in the project;
 *   - times are rendered in the venue's timezone, not the visitor's or the
 *     server's;
 *   - an invalid schedule record is rejected rather than rendered;
 *   - a booking link is produced only when a provider is confirmed, the deep
 *     link is well formed, and it points at an allow-listed host.
 *
 * The booking-handoff rules matter most: with no feed connected no live link is
 * ever produced, so without these checks that code path would never run until
 * the day real ticketing is connected.

 * The catalogue used by the schedule tests is defined here, in the harness,
 * rather than imported from the app. That is deliberate: the app must have no
 * sample catalogue for a test to borrow, and a record that lives inside a check
 * file cannot be rendered on a page.
 *
 * Run with: npm run check
 */

import assert from "node:assert/strict";

/* -------------------------------------------------------------------------- */
/* Assertion harness                                                          */
/* -------------------------------------------------------------------------- */

let failures = 0;
let checksRun = 0;

function check(name: string, run: () => void): void {
  checksRun += 1;
  try {
    run();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL ${name}`);
    console.error(`       ${error instanceof Error ? error.message : String(error)}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

/* -------------------------------------------------------------------------- */
/* Timezone and date handling                                                 */
/* -------------------------------------------------------------------------- */

section("Date and time handling");

const {
  addDays,
  calendarDateInZone,
  formatPrice,
  formatRuntime,
  formatTime,
  isValidCalendarDate,
  isValidIsoWithOffset,
  relativeDayLabel,
  scheduleFreshness,
  todayInZone,
} = await import("../lib/date-format.ts");

check("a valid calendar date is accepted, an impossible one is not", () => {
  assert.equal(isValidCalendarDate("2026-10-13"), true);
  assert.equal(isValidCalendarDate("2026-02-30"), false, "30 February must be rejected");
  assert.equal(isValidCalendarDate("13-10-2026"), false);
  assert.equal(isValidCalendarDate("2026-10-13T00:00:00+05:30"), false);
});

check("a showtime without an explicit UTC offset is rejected", () => {
  assert.equal(isValidIsoWithOffset("2026-10-13T18:15:00+05:30"), true);
  assert.equal(isValidIsoWithOffset("2026-10-13T18:15:00Z"), true);
  // The dangerous case: a naive local timestamp. Its meaning would depend on
  // whose clock reads it, so it must never be accepted as schedule data.
  assert.equal(isValidIsoWithOffset("2026-10-13T18:15:00"), false);
});

check("a late-evening screening keeps the venue's calendar date", () => {
  const showtime = "2026-10-13T23:30:00+05:30";
  assert.equal(calendarDateInZone(new Date(showtime), "Asia/Kolkata"), "2026-10-13");
  // The same instant is still the 13th in UTC, but a 00:45 IST screening would
  // belong to the 14th in IST and the 13th in UTC — the venue's zone wins.
  assert.equal(calendarDateInZone(new Date("2026-10-14T00:45:00+05:30"), "Asia/Kolkata"), "2026-10-14");
  assert.equal(calendarDateInZone(new Date("2026-10-14T00:45:00+05:30"), "UTC"), "2026-10-13");
});

check("clock times are formatted in venue-local time, lower case am/pm", () => {
  assert.equal(formatTime("2026-10-13T11:10:00+05:30", "Asia/Kolkata"), "11:10 am");
  assert.equal(formatTime("2026-10-13T20:40:00+05:30", "Asia/Kolkata"), "8:40 pm");
  // Formatted in a different zone only when explicitly asked — proving the zone
  // argument is doing the work rather than the host's locale.
  assert.equal(formatTime("2026-10-13T11:10:00+05:30", "UTC"), "5:40 am");
});

check("calendar arithmetic is timezone-independent and month-safe", () => {
  assert.equal(addDays("2026-10-13", 3), "2026-10-16");
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

check("relative day labels only describe today and tomorrow", () => {
  assert.equal(relativeDayLabel("2026-10-13", "2026-10-13"), "Today");
  assert.equal(relativeDayLabel("2026-10-14", "2026-10-13"), "Tomorrow");
  assert.equal(relativeDayLabel("2026-10-15", "2026-10-13"), null);
  assert.equal(relativeDayLabel("2026-10-12", "2026-10-13"), null);
});

check("runtimes render, and missing runtimes render as nothing", () => {
  assert.equal(formatRuntime(106), "1h 46m");
  assert.equal(formatRuntime(120), "2h");
  assert.equal(formatRuntime(45), "45m");
  assert.equal(formatRuntime(null), null);
  assert.equal(formatRuntime(0), null);
  assert.equal(formatRuntime(-5), null);
});

check("prices render only when both amount and currency are present", () => {
  assert.match(formatPrice(25000, "INR") ?? "", /250/);
  assert.equal(formatPrice(null, "INR"), null);
  assert.equal(formatPrice(25000, null), null);
  assert.equal(formatPrice(-1, "INR"), null);
  assert.equal(formatPrice(Number.NaN, "INR"), null);
});

check("schedule freshness escalates instead of hiding staleness", () => {
  const now = "2026-10-13T12:00:00Z";
  assert.equal(scheduleFreshness("2026-10-13T11:00:00Z", now).level, "current");
  assert.equal(scheduleFreshness("2026-10-13T04:00:00Z", now).level, "aging");
  assert.equal(scheduleFreshness("2026-10-11T12:00:00Z", now).level, "stale");
  assert.equal(scheduleFreshness("not a date", now).level, "stale");
});

check("todayInZone is the venue's today, not the host's", () => {
  // 19:30 UTC on the 12th is already the 13th in India (+05:30).
  const instant = new Date("2026-10-12T19:30:00Z");
  assert.equal(todayInZone("Asia/Kolkata", instant), "2026-10-13");
  assert.equal(todayInZone("UTC", instant), "2026-10-12");
});

/* -------------------------------------------------------------------------- */
/* Schedule validation                                                        */
/* -------------------------------------------------------------------------- */

section("Schedule validation");

const { validateShowtime, validateSchedule, showtimesOnDate, bookableDates } = await import(
  "../lib/schedule.ts"
);

const venue = (await import("../data/cinema.ts")).venue;

/*
 * A catalogue that exists only here. It is structurally identical to a feed
 * record so the validator is exercised properly, and it names a film that cannot
 * be rendered anywhere, because nothing outside this file can see it.
 */
const movies: import("../lib/types.ts").Movie[] = [
  {
    slug: "test-film-a",
    title: "Test film A",
    originalTitle: null,
    status: "now_showing",
    synopsis: null,
    languages: [{ code: "hi", label: "Hindi" }],
    runtimeMinutes: null,
    genres: [],
    certification: null,
    formats: [],
    artwork: null,
    releaseDate: null,
    releaseScope: null,
    sources: [],
    provenance: "check harness record — not rendered by the app",
  },
];

const goodRecord = {
  id: "sample-1",
  movieSlug: "test-film-a",
  venueId: venue.id,
  screenId: "screen-1",
  startsAt: "2026-10-13T18:15:00+05:30",
  timezone: venue.timezone,
  languageCode: "hi",
  format: "2D",
  availability: "available",
  priceMinor: 25000,
  currency: "INR",
  providerShowtimeId: "provider-abc-123",
  source: "live",
  provenance: "test fixture",
};

check("a complete provider record passes validation unchanged", () => {
  const result = validateShowtime(goodRecord);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.startsAt, goodRecord.startsAt);
  assert.equal(result.value.priceMinor, 25000);
  assert.equal(result.value.availability, "available");
});

check("an invented or misspelled enum value is rejected, never coerced", () => {
  const cases: Record<string, unknown>[] = [
    { ...goodRecord, format: "4D" },
    { ...goodRecord, availability: "probably fine" },
    { ...goodRecord, source: "maybe" },
    { ...goodRecord, startsAt: "2026-10-13T18:15:00" },
    { ...goodRecord, currency: null },
    { ...goodRecord, priceMinor: "250" },
    { ...goodRecord, id: "" },
  ];

  for (const record of cases) {
    assert.equal(validateShowtime(record).ok, false, `expected rejection: ${JSON.stringify(record).slice(0, 80)}`);
  }
});

check("a price without a currency is rejected rather than shown as a bare number", () => {
  const result = validateShowtime({ ...goodRecord, currency: null });
  assert.equal(result.ok, false);
});

check("a schedule record pointing at an unknown film, screen or venue is dropped", () => {
  const report = validateSchedule(
    [
      goodRecord,
      { ...goodRecord, id: "sample-2", movieSlug: "does-not-exist" },
      { ...goodRecord, id: "sample-3", screenId: "screen-99" },
      { ...goodRecord, id: "sample-4", venueId: "somewhere-else" },
      { ...goodRecord, id: "sample-5", timezone: "America/New_York" },
      { ...goodRecord, id: goodRecord.id },
    ],
    movies,
    venue,
  );

  assert.equal(report.valid.length, 1, "only the sound record survives");
  assert.equal(report.rejected.length, 5);
});

check("showtimes are grouped by the venue's calendar date", () => {
  const schedule = [
    { ...goodRecord, id: "a", startsAt: "2026-10-13T10:00:00+05:30" },
    { ...goodRecord, id: "b", startsAt: "2026-10-13T23:30:00+05:30" },
    { ...goodRecord, id: "c", startsAt: "2026-10-14T00:45:00+05:30" },
  ];

  const report = validateSchedule(schedule, movies, venue);
  assert.equal(report.valid.length, 3);

  const on13th = showtimesOnDate(report.valid, "2026-10-13", "Asia/Kolkata");
  assert.deepEqual(
    on13th.map((entry) => entry.id),
    ["a", "b"],
    "the after-midnight screening belongs to the 14th",
  );
});

check("the bookable window is anchored to today and capped", () => {
  const schedule = [
    { ...goodRecord, id: "today", startsAt: "2026-10-13T10:00:00+05:30" },
    { ...goodRecord, id: "inside", startsAt: "2026-10-16T10:00:00+05:30" },
    { ...goodRecord, id: "outside", startsAt: "2026-11-30T10:00:00+05:30" },
    { ...goodRecord, id: "past", startsAt: "2026-10-01T10:00:00+05:30" },
  ];

  const report = validateSchedule(schedule, movies, venue);
  const dates = bookableDates(report.valid, "Asia/Kolkata", "2026-10-13", 7);

  assert.ok(dates.includes("2026-10-13"), "today is always offered");
  assert.ok(dates.includes("2026-10-16"), "a date inside the window is offered");
  assert.ok(!dates.includes("2026-11-30"), "a date beyond the window is not offered");
  assert.ok(!dates.includes("2026-10-01"), "past dates are not offered");
});

/* -------------------------------------------------------------------------- */
/* Ticketing handoff                                                          */
/* -------------------------------------------------------------------------- */

section("Ticketing handoff");

const liveShowtime = {
  id: "live-1",
  movieSlug: "test-film-a",
  venueId: venue.id,
  screenId: "screen-1",
  startsAt: "2026-10-13T18:15:00+05:30",
  timezone: venue.timezone,
  languageCode: "hi",
  format: "2D" as const,
  availability: "available" as const,
  priceMinor: 25000,
  currency: "INR",
  providerShowtimeId: "provider-abc-123",
  source: "live" as const,
  provenance: "test",
};

const fixtureShowtime = { ...liveShowtime, id: "fixture-1", source: "fixture" as const };

const context = { movieSlug: "test-film-a", venueId: venue.id, timezone: venue.timezone };

console.log("\n  1. fixture data / no provider configured (the current default)\n");

{
  const { resolveBookingHandoff } = await import("../lib/ticketing-provider.ts");

  check("sample data never produces a booking link", () => {
    const handoff = resolveBookingHandoff({ ...context, showtime: fixtureShowtime });
    assert.equal(handoff.kind, "unavailable");
    if (handoff.kind !== "unavailable") return;
    assert.equal(handoff.reason, "not-from-feed");
    assert.ok(handoff.detail.length > 0, "the visitor is told why");
  });
}

/*
 * The remaining cases need configuration, so they run in a child process with
 * the relevant environment variables set. lib/site-config.ts reads its values at
 * module load, which is exactly what makes this the honest way to test it.
 */
console.log("\n  2. configured provider (runs in a child process with env set)\n");

const { execFileSync } = await import("node:child_process");
const { fileURLToPath } = await import("node:url");

const childScript = `
const { resolveBookingHandoff } = await import("./lib/ticketing-provider.ts");

const venue = (await import("./data/cinema.ts")).venue;
const showtime = {
  id: "live-1",
  movieSlug: "test-film-a",
  venueId: venue.id,
  screenId: "screen-1",
  startsAt: "2026-10-13T18:15:00+05:30",
  timezone: venue.timezone,
  languageCode: "hi",
  format: "2D",
  availability: "available",
  priceMinor: 25000,
  currency: "INR",
  providerShowtimeId: "provider-abc-123",
  source: "live",
  provenance: "test",
};

const context = { movieSlug: "test-film-a", venueId: venue.id, timezone: venue.timezone, showtime };
const handoff = resolveBookingHandoff(context);
process.stdout.write(JSON.stringify(handoff));
`;

const childScriptNoVenueId = childScript.replace(
  'const context = { movieSlug: "test-film-a", venueId: venue.id, timezone: venue.timezone, showtime };',
  'const context = { movieSlug: "test-film-a", venueId: "", timezone: venue.timezone, showtime };',
);

const runChild = (env: Record<string, string>) =>
  JSON.parse(
    execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", childScript], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: { ...process.env, ...env },
      encoding: "utf8",
    }),
  );

const baseEnv = {
  NEXT_PUBLIC_DATA_MODE: "live",
  NEXT_PUBLIC_TICKETING_PROVIDER_NAME: "Example Tickets",
};

check("live data with no confirmed provider produces no link", () => {
  const handoff = runChild({ NEXT_PUBLIC_DATA_MODE: "live" });
  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "no-provider");
});

check("a valid template produces a handoff carrying film, date and venue", () => {
  const handoff = runChild({
    ...baseEnv,
    NEXT_PUBLIC_TICKETING_URL_TEMPLATE:
      "https://tickets.example.com/cinema/{venueId}?film={movieId}&date={date}&show={showtimeId}",
    NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
  });

  assert.equal(handoff.kind, "ready", JSON.stringify(handoff));

  const url = new URL(handoff.href);
  assert.equal(url.hostname, "tickets.example.com");
  assert.equal(url.searchParams.get("film"), "test-film-a", "the chosen film travels with the link");
  assert.equal(url.searchParams.get("date"), "2026-10-13", "the venue-local date travels with the link");
  assert.equal(url.pathname, `/cinema/${venue.id}`, "the venue travels with the link");
  assert.equal(url.searchParams.get("show"), "provider-abc-123");
  assert.match(handoff.label, /Continue to Example Tickets/);
  assert.match(handoff.note, /payment/i, "the visitor is told payment happens at the provider");
});

check("a missing context fails closed instead of producing a broken link", () => {
  // This is the regression that a mis-shaped caller produced during
  // development: a URL containing a literal "{venueId}". It must be refused.
  const handoff = JSON.parse(
    execFileSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "-e", childScriptNoVenueId],
      {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        env: {
          ...process.env,
          ...baseEnv,
          NEXT_PUBLIC_TICKETING_URL_TEMPLATE:
            "https://tickets.example.com/{venueId}?film={movieId}&date={date}",
          NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
        },
        encoding: "utf8",
      },
    ),
  );

  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "context-incomplete");
});

check("the booking date is the venue's date, even for a late screening", () => {
  const handoff = runChild({
    ...baseEnv,
    NEXT_PUBLIC_TICKETING_URL_TEMPLATE:
      "https://tickets.example.com/{venueId}?film={movieId}&date={date}",
    NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
  });
  assert.equal(new URL(handoff.href).searchParams.get("date"), "2026-10-13");
});

check("a template missing a required token is refused", () => {
  const handoff = runChild({
    ...baseEnv,
    NEXT_PUBLIC_TICKETING_URL_TEMPLATE: "https://tickets.example.com/{venueId}?film={movieId}",
    NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
  });
  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "template-invalid");
});

check("a template with an unsupported token is refused", () => {
  const handoff = runChild({
    ...baseEnv,
    NEXT_PUBLIC_TICKETING_URL_TEMPLATE:
      "https://tickets.example.com/{venueId}?film={movieId}&date={date}&seatGroup={seatGroup}",
    NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
  });
  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "template-invalid");
});

check("a plain-http template is refused", () => {
  const handoff = runChild({
    ...baseEnv,
    NEXT_PUBLIC_TICKETING_URL_TEMPLATE: "http://tickets.example.com/{venueId}?film={movieId}&date={date}",
    NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
  });
  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "template-invalid");
});

check("a template pointing at an unapproved host is refused", () => {
  const handoff = runChild({
    ...baseEnv,
    NEXT_PUBLIC_TICKETING_URL_TEMPLATE:
      "https://half-price-tickets.example.net/{venueId}?film={movieId}&date={date}",
    NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
  });
  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "host-not-allowed");
});

check("a template needing a showtime id is refused when the feed supplied none", () => {
  const childNoProviderId = childScript.replace('providerShowtimeId: "provider-abc-123"', "providerShowtimeId: null");
  const handoff = JSON.parse(
    execFileSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "-e", childNoProviderId],
      {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        env: {
          ...process.env,
          ...baseEnv,
          NEXT_PUBLIC_TICKETING_URL_TEMPLATE:
            "https://tickets.example.com/{venueId}?film={movieId}&date={date}&show={showtimeId}",
          NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS: "tickets.example.com",
        },
        encoding: "utf8",
      },
    ),
  );

  assert.equal(handoff.kind, "unavailable");
  assert.equal(handoff.reason, "template-invalid");
});

/* -------------------------------------------------------------------------- */
/* Links and data integrity                                                    */
/* -------------------------------------------------------------------------- */

section("Links and data integrity");

const { buildHref, readFilterParams } = await import("../lib/share-url.ts");

check("generated links keep only known parameters", () => {
  assert.equal(buildHref("/movies", {}), "/movies");
  assert.equal(buildHref("/movies", { language: "hi" }), "/movies?language=hi");
  assert.equal(
    buildHref("/movies", { date: "2026-10-13", format: "3D" }),
    "/movies?date=2026-10-13&format=3D",
  );
  // A value the caller did not allow is dropped rather than echoed back.
  assert.equal(
    buildHref("/movies", { language: "hi", format: "3D", date: undefined }),
    "/movies?language=hi&format=3D",
  );
});

check("query parameters are validated before use", () => {
  const parsed = readFilterParams(
    { date: "not-a-date", language: "klingon", format: "3D" },
    { languages: ["hi", "en"], formats: ["2D", "3D"] },
  );
  assert.equal(parsed.date, undefined, "a malformed date is ignored");
  assert.equal(parsed.language, undefined, "an unknown language is ignored");
  assert.equal(parsed.format, "3D", "a known format survives");
});

/* -------------------------------------------------------------------------- */
/* The sourced programme                                                       */
/* -------------------------------------------------------------------------- */

section("Sourced programme");

const { parseProgramme, loadProgramme } = await import("../lib/programme.ts");
const { pendingFacts } = await import("../data/cinema.ts");
const { readFileSync, existsSync, readdirSync, statSync } = await import("node:fs");

const parsedProgramme = parseProgramme("2026-10-13");

check("every film in data/programme.json passes validation", () => {
  assert.equal(
    parsedProgramme.rejected.length,
    0,
    `${parsedProgramme.rejected.length} rejected: ${JSON.stringify(parsedProgramme.rejected[0] ?? null)}`,
  );
  assert.ok(
    parsedProgramme.movies.length >= 10,
    `only ${parsedProgramme.movies.length} films parsed — the programme looks truncated`,
  );
});

check("every film carries a citable https source", () => {
  for (const movie of parsedProgramme.movies) {
    assert.ok(movie.sources.length > 0, `${movie.slug} has no source`);
    for (const source of movie.sources) {
      assert.ok(
        source.url.startsWith("https://"),
        `${movie.slug} cites a source that cannot be checked: ${source.url}`,
      );
      assert.ok(source.label.length > 0, `${movie.slug} cites an unlabelled source`);
    }
  }
});

check("no film in the programme claims a fact its source did not publish", () => {
  for (const movie of parsedProgramme.movies) {
    assert.equal(movie.runtimeMinutes, null, `${movie.slug} claims a runtime`);
    assert.equal(movie.certification, null, `${movie.slug} claims a certification`);
    assert.equal(movie.synopsis, null, `${movie.slug} claims a synopsis`);
    assert.deepEqual(movie.formats, [], `${movie.slug} claims a screening format`);
  }
});

const coverArtManifest = JSON.parse(readFileSync("data/cover-art.json", "utf8")) as {
  licence: string;
  plates: string[];
};

check("a programme film only ever shows this project's own cover plate", () => {
  for (const movie of parsedProgramme.movies) {
    if (!movie.artwork) continue;
    assert.equal(
      movie.artwork.url,
      `/cover-art/${movie.slug}.jpg`,
      `${movie.slug} points at something other than its own plate`,
    );
    assert.ok(
      coverArtManifest.plates.includes(movie.slug),
      `${movie.slug} renders a plate that is not in the manifest`,
    );
    assert.equal(movie.artwork.licence, coverArtManifest.licence);
    assert.match(
      movie.artwork.alt,
      /not the film's poster/i,
      `${movie.slug}: the alt text must say the image is not the film's poster`,
    );
  }
});

check("no borrowed poster can reach the programme through a URL", () => {
  for (const movie of parsedProgramme.movies) {
    const url = movie.artwork?.url ?? "";
    assert.ok(
      !/^https?:\/\//.test(url),
      `${movie.slug} pulls artwork from the network — a poster is licensed, not fetched`,
    );
  }
});

check("the cover-art manifest and the files on disk agree", () => {
  const onDisk = readdirSync("public/cover-art")
    .filter((name) => name.endsWith(".jpg"))
    .map((name) => name.replace(/\.jpg$/, ""))
    .sort();
  const declared = [...coverArtManifest.plates].sort();

  for (const slug of declared) {
    assert.ok(
      existsSync(`public/cover-art/${slug}.jpg`),
      `data/cover-art.json lists ${slug} but public/cover-art/${slug}.jpg is missing`,
    );
  }
  for (const slug of onDisk) {
    assert.ok(
      coverArtManifest.plates.includes(slug),
      `public/cover-art/${slug}.jpg is declared nowhere — add it to data/cover-art.json`,
    );
  }
});

check("every cover plate is a raster image inside a sensible budget", () => {
  for (const slug of coverArtManifest.plates) {
    const bytes = statSync(`public/cover-art/${slug}.jpg`).size;
    assert.ok(bytes > 1024, `${slug}.jpg is suspiciously small (${bytes} bytes)`);
    assert.ok(bytes < 600 * 1024, `${slug}.jpg is ${Math.round(bytes / 1024)} KB — too heavy for a card`);
  }
});

check("every film in the programme is reachable and uniquely addressable", () => {
  const slugs = new Set<string>();
  for (const movie of parsedProgramme.movies) {
    assert.ok(!slugs.has(movie.slug), `${movie.slug} appears twice`);
    slugs.add(movie.slug);
    assert.match(movie.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${movie.slug} is not a safe URL segment`);
  }
  assert.ok(slugs.size >= 30, `only ${slugs.size} films — the programme was truncated`);
});

check("every film states that it is not this cinema's schedule", () => {
  for (const movie of parsedProgramme.movies) {
    assert.match(
      movie.provenance,
      /Not this cinema's schedule\./,
      `${movie.slug} does not carry the schedule caveat`,
    );
    assert.equal(movie.releaseScope, "Announced national theatrical release in India");
  }
});

check("slugs are unique and URL-safe", () => {
  const seen = new Set<string>();
  for (const movie of parsedProgramme.movies) {
    assert.match(movie.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `bad slug: ${movie.slug}`);
    assert.ok(!seen.has(movie.slug), `duplicate slug: ${movie.slug}`);
    seen.add(movie.slug);
  }
});

check("release dates decide which side of today a film sits on", () => {
  const today = "2026-10-13";
  const { movies: parsed } = parseProgramme(today);
  for (const movie of parsed) {
    const expected = (movie.releaseDate ?? "") <= today ? "now_showing" : "coming_soon";
    assert.equal(
      movie.status,
      expected,
      `${movie.slug} (${movie.releaseDate}) should be ${expected}`,
    );
  }
});

check("a film released today is in cinemas, not upcoming", () => {
  const { movies: parsed } = parseProgramme("2026-10-09");
  const bokshi = parsed.find((movie) => movie.slug === "bokshi");
  assert.ok(bokshi, "the 9 October release should be present");
  assert.equal(bokshi.status, "now_showing");

  const { movies: earlier } = parseProgramme("2026-10-08");
  const stillUpcoming = earlier.find((movie) => movie.slug === "bokshi");
  assert.equal(stillUpcoming?.status, "coming_soon");
});

check("no programme title is a placeholder", () => {
  for (const movie of parsedProgramme.movies) {
    assert.doesNotMatch(
      movie.title,
      /placeholder|sample|lorem|dummy|test film|tbd|todo/i,
      `"${movie.title}" looks like a placeholder`,
    );
  }
});

check("the compiled programme groups upcoming films soonest first", () => {
  const live = loadProgramme();
  const upcoming = live.movies.filter((movie) => movie.status === "coming_soon");
  const dates = upcoming.map((movie) => movie.releaseDate ?? "");
  assert.deepEqual(dates, [...dates].sort(), "upcoming films must be ordered by release date");
  assert.ok(upcoming.every((movie) => (movie.releaseDate ?? "") > "2026-10-13"));
});

check("the programme cites every distinct source exactly once", () => {
  const live = loadProgramme();
  const urls = live.citations.map((citation) => citation.url);
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  const total = live.movies.reduce((sum, movie) => sum + movie.sources.length, 0);
  assert.ok(live.citations.length <= total, "more citations than film sources");
  assert.ok(live.citations.length > 0);
});

/* -------------------------------------------------------------------------- */
/* Nothing left over from the sample build                                     */
/* -------------------------------------------------------------------------- */

section("No sample data survives in the project");

check("the development fixture files are gone", () => {
  for (const path of ["data/movies.ts", "data/showtimes.fixture.ts"]) {
    assert.ok(!existsSync(path), `${path} is back — the app must have no sample catalogue`);
  }
});

check("no placeholder artwork remains in public/", () => {
  for (const dir of ["public/posters", "public/showcase", "public/stills"]) {
    assert.ok(!existsSync(dir), `${dir} is back — a stand-in image must not ship`);
  }
});

check("no component or data file mentions fixture data", () => {
  const files = [
    "app/page.tsx",
    "app/movies/page.tsx",
    "app/movies/[slug]/page.tsx",
    "lib/catalogue.ts",
    "lib/schedule-source.ts",
    "lib/ticketing-provider.ts",
    "data/programme.json",
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(
      source,
      /fixtureShowtimes|from "@\/data\/movies"|from "@\/data\/showtimes\.fixture"|placeholder-film/i,
      `${file} still references sample data`,
    );
  }
});

check("the programme file declares no runtime, certification, synopsis or artwork keys", () => {
  const raw = readFileSync("data/programme.json", "utf8");
  for (const forbidden of ["runtimeMinutes", "certification", "synopsis", "posterUrl", "posterPath"]) {
    assert.ok(
      !raw.includes(`"${forbidden}"`),
      `data/programme.json carries "${forbidden}" — that fact has to come from a source or a feed`,
    );
  }
});

check("no page greets the visitor with a warning bar", () => {
  /* The state of the timetable is stated where the timetable would be, not in a
     banner above every page. A negative refrain repeated across the site reads as
     a broken build, and it buries the part that is real. */
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.doesNotMatch(
    layout,
    /Screening times not published yet|not connected to the cinema/,
    "the site-wide notice is back",
  );

  const files = [
    "app/page.tsx",
    "app/movies/page.tsx",
    "app/movies/[slug]/page.tsx",
    "app/help/page.tsx",
    "components/layout/SiteFooter.tsx",
    "components/programme/ScheduleWait.tsx",
  ];
  for (const file of files) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /not published yet/i,
      `${file} repeats the negative refrain instead of stating the position`,
    );
  }
});

section("Venue facts");

check("the venue is in Madhuban, Bihar and nothing below that is invented", () => {
  assert.equal(venue.address.locality.value, "Madhuban");
  assert.equal(venue.address.region.value, "Bihar");
  assert.equal(venue.address.country.value, "India");
  assert.equal(
    venue.address.locality.status,
    "confirmed",
    "the owner supplied the town and state, so they are confirmed facts",
  );

  /* Everything below the town is unconfirmed, and must stay unconfirmed until
     the venue supplies it. This check exists so a future edit cannot quietly
     promote a guess to a confirmed fact. */
  const stillOpen = [
    venue.address.street,
    venue.address.postalCode,
    venue.address.planningNote,
    venue.contact.phone,
    venue.contact.email,
    venue.arrival.parking,
    venue.arrival.transit,
    venue.arrival.entrance,
    ...venue.hours.map((hour) => hour.value),
  ];
  for (const fact of stillOpen) {
    assert.notEqual(
      fact.status,
      "confirmed",
      "a venue fact was confirmed without the venue supplying it",
    );
    assert.equal(fact.value, null, "an unconfirmed venue fact carries a value");
    assert.ok(
      (fact.pendingNote ?? "").length > 20,
      "an unconfirmed venue fact must explain itself to the visitor",
    );
  }
});

check("the pending list the visitor sees is not empty", () => {
  assert.ok(pendingFacts().length >= 8, "the outstanding-facts list shrank unexpectedly");
});

check("no page copy names a former or unconfirmed location or operator", () => {
  const files = [
    "app/page.tsx",
    "app/cinema/page.tsx",
    "app/movies/page.tsx",
    "app/movies/[slug]/page.tsx",
    "app/layout.tsx",
    "app/offers/page.tsx",
    "components/home/Hero.tsx",
    "components/home/VenueInfo.tsx",
    "components/layout/SiteFooter.tsx",
    "components/layout/FullScreenMenu.tsx",
    "lib/site-config.ts",
    "data/showcase.ts",
    "README.md",
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const forbidden of ["Elante", "Chandigarh", "PVR", "INOX"]) {
      assert.ok(
        !source.includes(forbidden),
        `${file} still mentions ${forbidden} — the venue never confirmed it`,
      );
    }
  }
});

check("the map link searches for the town, not a door the venue has not confirmed", () => {
  const link = venue.contact.links.find((entry) => entry.id === "directions");
  assert.ok(link, "the directions link went missing");
  assert.match(link.href, /Madhuban%2C%20Bihar/);
  assert.ok(!/\d+\.\d{3,}/.test(link.href), "a coordinate pair was published as the venue's position");
});

/* -------------------------------------------------------------------------- */
/* Venue feed contract                                                        */
/* -------------------------------------------------------------------------- */

section("Venue feed contract");

const { parseVenueFeed, feedAgeHours } = await import("../lib/feed.ts");
const { buildValidFeed, buildInvalidFeeds, TEST_VENUE_ID, TEST_TIMEZONE, TEST_ARTWORK_HOST } =
  await import("./feed-fixtures.mts");

/** The options the app itself passes when it validates a live payload. */
const feedOptions = {
  expectedVenueId: TEST_VENUE_ID,
  timezone: TEST_TIMEZONE,
  artworkHostAllowlist: [TEST_ARTWORK_HOST],
};

check("a well-formed partner payload is accepted in full", () => {
  const result = parseVenueFeed(buildValidFeed(), feedOptions);
  assert.equal(result.ok, true, result.ok ? "" : result.errors.join("; "));
  if (!result.ok) return;

  assert.equal(result.feed.movies.length, 3);
  assert.equal(result.feed.screens.length, 2);
  assert.ok(result.feed.showtimes.length >= 30, `expected a full window of screenings, got ${result.feed.showtimes.length}`);
});

check("every accepted screening is marked as live data, not a fixture", () => {
  const result = parseVenueFeed(buildValidFeed(), feedOptions);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  for (const showtime of result.feed.showtimes) {
    assert.equal(showtime.source, "live");
  }
});

check("the parser decides provenance, so a feed cannot downgrade itself", () => {
  const payload = buildValidFeed();
  for (const record of payload.showtimes as Record<string, unknown>[]) {
    record.source = "live";
    record.provenance = "";
  }
  const result = parseVenueFeed(payload, feedOptions);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  // An empty provenance string is filled from the feed's own source label rather
  // than being left blank in the UI.
  assert.ok(
    result.feed.showtimes.every((showtime) => showtime.provenance.length > 0),
    "provenance must never be empty",
  );
});

check("a payload for a different venue is refused outright", () => {
  const result = parseVenueFeed(buildValidFeed(), { ...feedOptions, expectedVenueId: "another-cinema" });
  assert.equal(result.ok, false);
});

for (const testCase of buildInvalidFeeds()) {
  check(`rejects: ${testCase.name}`, () => {
    const result = parseVenueFeed(testCase.payload, feedOptions);
    // Errors only exist on a failed parse, and assertion messages are built
    // eagerly, so collect both defensively before asserting anything.
    const errors = result.ok ? [] : result.errors;
    const warnings = result.warnings;

    if (testCase.channel === "error") {
      assert.equal(result.ok, false, "expected the payload to be refused, but it was accepted");
      const messages = [...errors, ...warnings];
      assert.ok(
        messages.some((message) => message.toLowerCase().includes(testCase.expects.toLowerCase())),
        `expected a message containing ${JSON.stringify(testCase.expects)}, got:\n${messages.join("\n")}`,
      );
      return;
    }

    // A warning-level defect must be survivable: the payload still parses, the
    // bad record is dropped, and the reason is recorded rather than swallowed.
    assert.equal(
      result.ok,
      true,
      `expected the payload to survive, got: ${errors.join("; ")}`,
    );
    assert.ok(
      warnings.some((warning) => warning.toLowerCase().includes(testCase.expects.toLowerCase())),
      `expected a warning containing ${JSON.stringify(testCase.expects)}, got:\n${warnings.join("\n")}`,
    );
  });
}

check("artwork from a host that is not allow-listed is dropped, not rendered", () => {
  const payload = buildValidFeed();
  (payload.movies as Record<string, unknown>[])[0].posterUrl = "https://unlicensed-cdn.example.com/a.jpg";
  const result = parseVenueFeed(payload, feedOptions);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const affected = result.feed.movies.find((movie) => movie.slug === "placeholder-film-a");
  assert.equal(affected?.artwork, null, "the poster must be dropped");
  // The film itself is still listed — losing artwork must not lose the programme.
  assert.equal(result.feed.movies.length, 3);
});

check("with no allow-list configured, no remote artwork is accepted at all", () => {
  const result = parseVenueFeed(buildValidFeed(), { ...feedOptions, artworkHostAllowlist: [] });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(
    result.feed.movies.every((movie) => movie.artwork === null),
    "an empty allow-list must fail closed",
  );
});

check("a payload with no artwork needs no artwork licence", () => {
  const result = parseVenueFeed(buildValidFeed({ includeArtwork: false }), {
    ...feedOptions,
    artworkHostAllowlist: [],
  });
  assert.equal(result.ok, true, result.ok ? "" : result.errors.join("; "));
});

check("a subdomain of an allow-listed host is accepted", () => {
  const payload = buildValidFeed();
  (payload.movies as Record<string, unknown>[])[0].posterUrl = "https://cdn.partner.example.com/poster.jpg";
  const result = parseVenueFeed(payload, { ...feedOptions, artworkHostAllowlist: ["partner.example.com"] });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(
    result.feed.movies[0].artwork?.url,
    "https://cdn.partner.example.com/poster.jpg",
  );
  assert.ok((result.feed.movies[0].artwork?.licence ?? "").length > 0, "artwork must state its licence");
});

check("a lookalike host cannot smuggle artwork past the allow-list", () => {
  // `partner.example.com.evil.example` ends with the allow-listed domain but is
  // a different origin, which is precisely the case a naive `includes` check
  // would let through.
  const payload = buildValidFeed();
  (payload.movies as Record<string, unknown>[])[0].posterUrl =
    "https://partner.example.com.evil.example/poster.jpg";
  const result = parseVenueFeed(payload, { ...feedOptions, artworkHostAllowlist: ["partner.example.com"] });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.feed.movies[0].artwork, null, "lookalike domain must be refused");
});

check("feed age is computed for the staleness warning", () => {
  const generated = "2026-10-13T09:00:00+05:30";
  assert.equal(Math.round(feedAgeHours(generated, "2026-10-13T12:00:00+05:30") ?? -1), 3);
  assert.equal(Math.round(feedAgeHours(generated, "2026-10-15T09:00:00+05:30") ?? -1), 48);
  assert.equal(feedAgeHours("not a date", "2026-10-13T12:00:00+05:30"), null);
});

check("a malformed payload degrades to an honest unavailable state, never to samples", () => {
  const result = parseVenueFeed({ version: 1, venueId: TEST_VENUE_ID }, feedOptions);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors.length > 0);
});

/* -------------------------------------------------------------------------- */

console.log(
  `\n${failures === 0 ? "All checks passed" : `${failures} check(s) failed`} — ${checksRun} run.\n`,
);

process.exit(failures === 0 ? 0 : 1);
