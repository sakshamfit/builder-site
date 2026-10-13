/**
 * Self-checks: `npm run check`
 *
 * These are not vanity tests. Each one covers a rule that keeps the site
 * truthful, and each is a rule that is *not* reachable through the UI while the
 * project is in fixture mode:
 *
 *   - times are rendered in the venue's timezone, not the visitor's or the
 *     server's;
 *   - an invalid schedule record is rejected rather than rendered;
 *   - a booking link is produced only when a provider is confirmed, the deep
 *     link is well formed, and it points at an allow-listed host.
 *
 * The booking-handoff rules matter most: in fixture mode no link is ever
 * produced, so without these checks that code path would never run until the
 * day real ticketing is connected.
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
const movies = (await import("../data/movies.ts")).movies;

const goodRecord = {
  id: "sample-1",
  movieSlug: "lantern-keeper",
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
  movieSlug: "lantern-keeper",
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

const context = { movieSlug: "lantern-keeper", venueId: venue.id, timezone: venue.timezone };

console.log("\n  1. fixture data / no provider configured (the current default)\n");

{
  const { resolveBookingHandoff } = await import("../lib/ticketing-provider.ts");

  check("sample data never produces a booking link", () => {
    const handoff = resolveBookingHandoff({ ...context, showtime: fixtureShowtime });
    assert.equal(handoff.kind, "unavailable");
    if (handoff.kind !== "unavailable") return;
    assert.equal(handoff.reason, "fixture-data");
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
  movieSlug: "lantern-keeper",
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

const context = { movieSlug: "lantern-keeper", venueId: venue.id, timezone: venue.timezone, showtime };
const handoff = resolveBookingHandoff(context);
process.stdout.write(JSON.stringify(handoff));
`;

const childScriptNoVenueId = childScript.replace(
  'const context = { movieSlug: "lantern-keeper", venueId: venue.id, timezone: venue.timezone, showtime };',
  'const context = { movieSlug: "lantern-keeper", venueId: "", timezone: venue.timezone, showtime };',
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
  assert.equal(url.searchParams.get("film"), "lantern-keeper", "the chosen film travels with the link");
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
/* Links and fixture integrity                                                */
/* -------------------------------------------------------------------------- */

section("Links and fixture integrity");

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

const { fixtureShowtimes } = await import("../data/showtimes.fixture.ts");

check("no fixture record claims availability or a price", () => {
  assert.ok(fixtureShowtimes.length > 0, "there are samples to render");
  for (const showtime of fixtureShowtimes) {
    assert.equal(showtime.availability, "unknown", `${showtime.id} must not claim availability`);
    assert.equal(showtime.priceMinor, null, `${showtime.id} must not claim a price`);
    assert.equal(showtime.source, "fixture");
  }
});

check("every fixture showtime passes validation against the venue record", () => {
  const report = validateSchedule(fixtureShowtimes, movies, venue);
  assert.equal(
    report.rejected.length,
    0,
    `${report.rejected.length} fixture record(s) rejected: ${JSON.stringify(report.rejected[0] ?? null)}`,
  );
  assert.equal(report.valid.length, fixtureShowtimes.length);
});

check("fixture showtimes are offset correctly for the venue's timezone", () => {
  const sample = fixtureShowtimes[0];
  assert.match(sample.startsAt, /\+05:30$/, "Asia/Kolkata has no daylight saving, so +05:30 always");
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
  assert.equal(affected?.posterPath, "", "the poster must be dropped");
  assert.equal(affected?.posterAlt, "");
  // The film itself is still listed — losing artwork must not lose the programme.
  assert.equal(result.feed.movies.length, 3);
});

check("with no allow-list configured, no remote artwork is accepted at all", () => {
  const result = parseVenueFeed(buildValidFeed(), { ...feedOptions, artworkHostAllowlist: [] });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(
    result.feed.movies.every((movie) => movie.posterPath === ""),
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
  assert.equal(result.feed.movies[0].posterPath, "https://cdn.partner.example.com/poster.jpg");
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
  assert.equal(result.feed.movies[0].posterPath, "", "lookalike domain must be refused");
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
