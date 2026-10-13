# Venue feed contract

This is the document to send to the venue's ticketing partner. It describes the
JSON payload this website consumes, and what the site does with every field.

**Give this to whoever can produce the data. When they can produce it, going live
is three environment variables and no code.**

```
NEXT_PUBLIC_DATA_MODE=live
SCHEDULE_FEED_URL=https://<partner host>/<venue>/programme.json
POSTER_HOST_ALLOWLIST=<partner artwork CDN host>
# SCHEDULE_FEED_TOKEN=<bearer token, if the endpoint requires one>
```

The site is validated against this contract before anything reaches a page:
`lib/feed.ts` is the executable version of this file, and it is covered by 33
self-checks (`npm run check`) including one deliberately broken payload per rule.

---

## 1. Transport

| | |
| --- | --- |
| Method | `GET` |
| Auth | `Authorization: Bearer <token>` — optional; set `SCHEDULE_FEED_TOKEN` if your endpoint needs it |
| Timeout | 8 seconds. A slower response is treated as unreachable, and the site shows its "schedule unavailable" state |
| Re-fetch | At most once every 5 minutes (`SCHEDULE_REVALIDATE_SECONDS`), and never on a visitor's request |
| Content type | `application/json` |
| Caching | Send `Cache-Control` if you have it; the site applies its own revalidation window regardless |

The request is made **server-side only**. The token never reaches a browser.

## 2. Payload

```jsonc
{
  "version": 1,                                  // required, must be 1
  "venueId": "elante-chandigarh",                // required, must match this site's venue
  "generatedAt": "2026-10-13T09:15:00+05:30",    // required, ISO 8601 WITH offset
  "sourceLabel": "Nameless Ticketing partner feed", // shown to visitors as the data's origin
  "artworkLicence": "Asset kit ref #1234, licensed to the venue", // required if you send posters

  "screens": [
    {
      "id": "audi-1",                 // stable; referenced by showtimes
      "name": "Audi 1",               // exactly as the venue names it — this is shown to visitors
      "formats": ["2D", "3D"],        // from the allowed list below
      "accessibleFeatures": []        // free text; only include what the venue has confirmed
    }
  ],

  "movies": [
    {
      "slug": "some-film",            // required, kebab-case; used in the public URL
      "title": "Some Film",
      "originalTitle": null,
      "status": "now_showing",        // or "coming_soon"
      "synopsis": "…",
      "languages": [{ "code": "hi", "label": "Hindi" }],  // at least one
      "runtimeMinutes": 132,          // whole minutes, or null. 0 and 601 are rejected.
      "genres": ["Drama"],
      "certification": { "label": "U/A 13+", "body": "CBFC" },  // or null
      "formats": ["2D"],
      "releaseDate": null,            // ISO date for coming-soon titles, else null

      // Artwork — all three fields together, or omit all three
      "posterUrl": "https://cdn.example.com/posters/some-film.jpg",
      "posterAlt": "Some Film poster: a description of the image",

      "artworkCredit": "Asset kit ref #1234",
      "copyCredit": "Synopsis supplied by the distributor"
    }
  ],

  "showtimes": [
    {
      "id": "some-film-2026-10-13-1915",   // stable and unique
      "movieSlug": "some-film",
      "venueId": "elante-chandigarh",
      "screenId": "audi-1",
      "startsAt": "2026-10-13T19:15:00+05:30",  // ISO 8601 WITH an explicit offset
      "timezone": "Asia/Kolkata",
      "languageCode": "hi",
      "format": "2D",
      "availability": "unknown",       // unknown | available | few_left | sold_out
      "priceMinor": null,              // minor units (paise). null unless you supply a real price.
      "currency": null,                // e.g. "INR" — required whenever priceMinor is set
      "providerShowtimeId": "…",       // your own id, echoed back on the booking handoff
      "provenance": "Partner API v2"   // free text, recorded with the record
    }
  ]
}
```

### Allowed values

- **`formats`** — `2D`, `3D`, `IMAX`, `4DX`, `ScreenX`, `Dolby Atmos`. Anything else is
  rejected. If the venue offers a format not on this list, that is a deliberate
  decision to make together, not a string to pass through.
- **`availability`** — `unknown`, `available`, `few_left`, `sold_out`.
- **Time zone** — `Asia/Kolkata` (the venue's own). A record claiming another zone
  is dropped.

## 3. What the site enforces

These are not style preferences. Each one has a test in `npm run check`.

**Referential integrity.** A screening may only name a film, screen and venue that
exist in the same payload. A screening for an unknown film is dropped, with the
reason logged, and the rest of the payload still renders.

**No unlicensed artwork.** A `posterUrl` is only accepted when:
1. its host appears in `POSTER_HOST_ALLOWLIST`, and
2. the payload also supplies `artworkLicence`, and
3. `posterAlt` is non-empty.

Fail any of the three and the poster is dropped, the film still lists, and the
reason is recorded. With an empty allow-list — the default — **no remote artwork
is accepted at all**. This is the mechanism that keeps unlicensed film artwork off
the site even if someone pastes a URL in by accident.

Artwork must be HTTPS. The single exception is a loopback host, which exists so
`npm run feed:serve` can exercise the pipeline locally.

**No self-declared fixtures.** A record arriving from the live feed cannot claim
`source: "fixture"`. The parser decides provenance, not the payload.

**No invented values.** An unknown format, an unknown availability state, a
runtime of 0 or 900 minutes, a price with no currency, a duplicate id, or a start
time without an offset are all errors or drops. Nothing is coerced. Coercion is
how a site ends up advertising a 3D screening that is really 2D.

**An empty programme is honest, not broken.** If nothing survives validation, the
site shows "we could not read the schedule" rather than an empty grid.

**Stale data is labelled, not hidden.** Past `SCHEDULE_STALE_AFTER_HOURS` (default
12) the payload is marked stale and the notice appears next to the times. The
schedule is not withdrawn — a slightly old listing beats no listing, as long as it
says so.

## 4. Images: what the site needs from you

Film posters and stills are owned by the studios and distributors. This site will
only display artwork it can prove is licensed, which means **the partner or the
venue must supply it**:

- **preferred** — you host the posters on your CDN and send `posterUrl`; the site
  optimises and serves them with correct sizing
- **also fine** — you send the files; they go in `public/posters/` and the site
  serves them locally
- **not acceptable** — a URL scraped from a search engine, a fan site, IMDb, TMDB,
  Wikipedia or a distributor's public website without a licence

`artworkLicence` is a free-text field on purpose: it should name the agreement,
asset kit or reference that covers the images, so there is a written answer to
"where did these posters come from?" at any point in the future.

## 5. Trying it now, without a partner

```bash
npm run feed:serve          # a stand-in feed on http://127.0.0.1:4100

# in another terminal
NEXT_PUBLIC_DATA_MODE=live \
SCHEDULE_FEED_URL=http://127.0.0.1:4100/programme.json \
POSTER_HOST_ALLOWLIST=127.0.0.1 \
npm run dev
```

The stand-in serves deliberately ugly placeholder titles, so a test payload can
never be mistaken for a real programme. It also exposes failure endpoints:

| Endpoint | Exercises |
| --- | --- |
| `/programme.json` | the happy path |
| `/no-artwork.json` | a payload with no posters — films still list, no images |
| `/broken.json` | truncated JSON, as a partner timeout produces |
| `/unauthorised.json` | a 401, and the "check your token" hint |
| `/slow.json` | a 30-second response, against the 8-second timeout |
| `/stale.json` | a valid payload generated three days ago |

## 6. What the site does *not* need

- **Seat maps or seat counts.** The site never renders a seat plan; that is the
  partner's job.
- **Payment or card data of any kind.** It never touches it.
- **Customer accounts, loyalty or booking history.**
- **Trailers**, unless the distribution rights and a transcript are supplied too.
- **Analytics identifiers or tracking pixels.**

The site's job is to tell someone what is on, when, in which auditorium and in
which language, and then hand them to you with the correct context attached.
