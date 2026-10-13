# Cinema at Elante Mall — venue website

A mobile-first website that **showcases the cinema hall** at Elante Mall, Chandigarh — the
auditorium, the screen, the seating, the foyer and the route from the mall to your seat — with
showtimes and film listings supporting that, rather than the other way round.

This is a venue showcase, not a booking engine. It shows the hall and tells you what is playing; when
you are ready, it hands you to the venue's ticketing partner to choose seats and pay.

> **Status: development build, not launch-ready.**
> The site currently serves **sample data** — fictional films with original placeholder artwork and
> a generated schedule. It is structured so that connecting the venue's real schedule and ticketing
> partner is a configuration change, not a rewrite. Nothing on the site invents a film, a showtime, a
> price, an availability state, a facility or a policy.

---

## 1. Run it locally

```bash
npm install
npm run dev            # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run check` | Runs the project's self-checks (31 assertions) covering timezone maths, schedule validation and the ticketing handoff rules. |
| `npm run build` | Production build. |
| `npm run lint` | ESLint (`eslint-config-next`). |
| `npm run typecheck` | `tsc --noEmit`. |

Always run `npm run check` before changing anything in `lib/` — the rules it protects are not all
reachable through the UI while the project is in fixture mode.

---

## 2. What is real and what is sample data

| Content | State |
| --- | --- |
| Mall-level address (178-178A, Purv Marg, Industrial Area Phase I, Chandigarh 160002) | Confirmed — publicly listed mall address |
| Google Maps search link for that address | Confirmed — a text search, **not** a pinned cinema entrance |
| Cinema trade name, logo, brand colours | **Not confirmed** — the site uses the working name "Cinema at Elante Mall" |
| Screen names and count | **Not confirmed** — fixtures use working labels ("Screen 1"…), and the UI says so |
| Box office hours, phone, email, parking, transit, entrances | **Not confirmed** — rendered as "awaiting venue", never guessed |
| Accessibility provision | **Not confirmed** — listed item by item with its own verification state |
| Films, runtimes, certifications, synopses | **Sample** — original fictional entries written for this project |
| Poster artwork | **Sample** — original abstract images generated for this project |
| Cinema-hall showcase imagery | **Illustration** — original generated images, captioned on screen as illustrations and not as photographs of this venue |
| Schedule | **Sample** — generated for the next 7 days at build time |
| Prices and seat availability | **Never invented** — the fixtures deliberately carry `null`/`unknown`, and the UI states that these come from the ticketing partner |

The site says all of this to the visitor too: a development banner sits above the header, the
schedule panel is labelled "Development", and every film card is tagged as a sample.

### Why the gaps are published rather than filled

A cinema site is used to make travel and spending decisions. An unverified claim about step-free
access, an entrance, or a refund policy costs someone a wasted journey. So the project ships a
`Fact<T>` type (`lib/types.ts`) whose values are only rendered when `status === "confirmed"`; anything
else renders the owner's outstanding question instead (see `/cinema` → "Still being confirmed").

---

## 3. Project structure

```text
app/                      routes (App Router)
  page.tsx                home: hero → now showing → showtimes → coming soon → venue
  movies/page.tsx         catalogue with language/format filters
  movies/[slug]/page.tsx  one film, its dates and screenings
  cinema/page.tsx         location, hours, facilities, accessibility, contact
  offers/page.tsx         approved promotions only
  help/page.tsx           booking handoff steps, FAQs, policies
  sitemap.ts robots.ts    generated from NEXT_PUBLIC_SITE_URL
components/
  layout/                 header, footer, primary nav, mobile dialog
  showcase/               venue spotlight (ARIA tabs), highlights, full gallery
  home/                   hero, showcase section, now showing, coming soon, experience, visit
  movies/                 poster card, grid, filters
  showtimes/              date selector, film groups, screening chips, schedule status
  cinema/                 location, facilities, screens
  booking/                the ticket handoff component
  ui/                     button, badge, poster image, empty state
data/
  showcase.ts             the cinema-hall showcase: images, captions, highlights
  cinema.ts               venue facts, each with a confirmation status
  movies.ts               SAMPLE catalogue
  showtimes.fixture.ts    SAMPLE schedule
  offers.ts faqs.ts       approved content only
lib/
  ticketing-provider.ts   the single boundary to the ticket provider
  schedule.ts             validation and grouping
  schedule-source.ts      fixture vs. live selection
  showtime-view.ts        display models (all formatting happens here)
  date-format.ts          timezone-safe date/time/price formatting
  types.ts site-config.ts clock.ts share-url.ts metadata.ts cinema-content.ts
scripts/checks.mts        self-checks (npm run check)
ASSET_CREDITS.md          provenance for every image and every idea borrowed
```

Every screen is a server component. The only client components are the mobile navigation dialog and
the two navigation helpers that mark the current section — so the whole booking journey works with
JavaScript disabled, and each date/filter choice is a real, shareable URL.

---

## 4. The cinema-hall showcase

The centrepiece of the site. It sits directly under the hero, ahead of anything ticket-related,
because the first question a venue site answers is "what is this place like?".

* **`VenueSpotlight`** is a proper WAI-ARIA tabs widget — roving tabindex so the whole strip is one
  tab stop, arrow keys and Home/End to move between spaces, a labelled `tabpanel`, and visible
  caption text. No interaction is required to read any caption.
* **`ShowcaseHighlights`** lists what the cinema offers as facts where the venue has confirmed them
  and as open questions where it has not. Seven of the eight lines are marked "Awaiting venue",
  because seating, projection, access and concession details are genuinely unconfirmed.
* **`VenueGallery`** shows the full set of spaces on `/cinema`, with the same caption and provenance
  treatment.
* **Every image is an original illustration**, and says so on screen. `ShowcaseImage.depictsVenue`
  drives that wording, so approved venue photography automatically stops being labelled an
  illustration once it lands.

### Motion without a video file

The hero still and the spotlight image carry a very slow ambient drift implemented purely in CSS.
That choice was deliberate: no licensed footage of this cinema exists yet, a background video would
add autoplay-policy, offscreen-pause and reduced-motion complexity for little gain, and decorative
CSS motion is collapsed outright by the existing `prefers-reduced-motion: reduce` rule in
`app/globals.css` — so it is safe by construction rather than by careful implementation.

---

## 5. Data: how the schedule works

```
data/showtimes.fixture.ts  ──┐
                             ├─► validateSchedule() ─► ScheduleSnapshot ─► view models ─► UI
(live operator feed) ────────┘        (lib/schedule.ts)   (lib/schedule-source.ts)
```

* **A showtime is only rendered if it passes validation.** `validateShowtime` requires an ISO 8601
  timestamp **with an explicit UTC offset**, a known format, a known availability state, and a price
  only when a currency accompanies it. An unparseable or unfamiliar value is rejected, not coerced —
  coercion is how a site ends up claiming a format the venue never screens.
* **Records are cross-checked** against the catalogue and the venue record, so a screening can never
  reference a film, screen or venue that does not exist. Rejections are surfaced in development on
  `/movies` and are covered by `npm run check`.
* **Fixtures describe no prices and no availability.** Every sample record carries
  `availability: "unknown"`, `priceMinor: null`. The storefront slots for both are implemented and
  render as soon as a validated live feed supplies them.
* **Staleness is stated, not hidden.** `ScheduleStatus` shows the source and when the snapshot was
  produced, and escalates to "times may have changed — confirm with the cinema" once a snapshot is
  more than a day old.

### Going live

1. Implement `loadLiveSchedule()` in `lib/schedule-source.ts` (the stub is deliberately unfinished —
   a half-written integration that could return invented data would be worse than none).
2. Validate every record through `validateSchedule` before it reaches the UI.
3. Set `NEXT_PUBLIC_DATA_MODE=live` and `SCHEDULE_FEED_URL` (server-only). With `live` and no feed,
   the site renders an honest "we cannot show times right now" state while the rest of the site keeps
   working — that state is implemented, not theoretical.
4. The development banner and the "Sample" tags disappear automatically.

---

## 6. Booking handoff

`lib/ticketing-provider.ts` is the **only** place that knows how a visitor leaves to buy a ticket.
There is no seat map, no cart, no checkout and no confirmation page anywhere in this project — seat
selection and payment belong to the authorised provider.

A booking link is produced only when **all** of these hold:

1. the schedule is live data (fixture data never links out);
2. a provider name is configured, so the button can say where it goes;
3. the deep-link template is valid https and contains `{movieId}`, `{date}` and `{venueId}`, with no
   unsupported `{token}` left in it;
4. every value the template needs is present (a missing value fails closed rather than shipping a
   URL containing a literal `{movieId}`);
5. the resulting host is on the owner-approved allow-list.

Otherwise the site explains, in plain language, what it cannot do and what to do instead. There is no
disabled button and no fake checkout. On screen, each ticket chip names the destination in its
accessible label, and each film group carries a visible line such as *"You will finish seat selection
and payment on [Provider]. We never handle card details here."*

Configuration (see `.env.example`):

```bash
NEXT_PUBLIC_TICKETING_PROVIDER_NAME="<confirmed provider>"
NEXT_PUBLIC_TICKETING_URL_TEMPLATE="https://provider.example/cinema/{venueId}?film={movieId}&date={date}&show={showtimeId}"
NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS="provider.example"
```

The handoff carries the film, the **venue-local date**, the venue and (when the feed supplies one)
the provider's own screening id — verified in `npm run check`.

---

## 7. Dates, times and timezones

The venue operates in one timezone (`NEXT_PUBLIC_VENUE_TIMEZONE`, default `Asia/Kolkata`) while a
visitor's device may be in another. Therefore:

* showtimes are stored with explicit offsets and displayed in the **venue's** timezone;
* a 23:30 screening belongs to that calendar day, and a 00:45 screening belongs to the next one —
  grouping follows the venue's calendar, not UTC;
* nothing formats a time from the visitor's clock. `lib/showtime-view.ts` precomputes every display
  string on the server, so server and client markup cannot disagree and hydration is stable;
* `lib/clock.ts` is the single place that reads the wall clock, and it takes the timezone as an input.

---

## 8. Brand, attribution and never-claims

* The public name is configurable (`NEXT_PUBLIC_BRAND_DISPLAY_NAME`) and defaults to the neutral
  working title **"Cinema at Elante Mall"**.
* **This site does not imply an official relationship** with the mall, any cinema chain or any
  operator. That is stated in the footer. An attribution line renders only when the operator supplies
  approved wording (`NEXT_PUBLIC_BRAND_ATTRIBUTION`).
* No brand marks, mall logos, film titles, posters, stills or trailers from any source project or fan
  project ship here — see `ASSET_CREDITS.md`.
* The copy avoids unverifiable superlatives. There is no "largest", "best", "official", "exclusive",
  and no format claim (IMAX, 4DX, Dolby, ScreenX) unless the venue's own record states it.
* The only external image source configured in `next.config.ts` is this repository's own `public/`
  directory — remote patterns are deliberately absent, so unlicensed artwork cannot be hot-linked by
  accident.

---

## 9. Accessibility and motion

* Semantic landmarks, one `h1` per page, a skip link as the first tab stop, and visible focus rings
  that are never removed.
* Date selection, filters and every booking action are real links or buttons — operable by keyboard,
  announceable by screen reader, and functional with JavaScript disabled. Selection is exposed with
  `aria-current` (`="date"` on the date strip), not colour alone.
* The mobile menu is a modal dialog: focus moves in, is trapped, Escape closes it, focus returns to
  the toggle, and background scrolling is locked.
* FAQs use native `<details>`, so they need no JavaScript.
* Poster artwork has descriptive alt text; the generated hero still is decorative (`alt=""`) and is
  captioned as a placeholder.
* Motion is limited to short opacity/transform transitions. `prefers-reduced-motion: reduce`
  collapses animation globally. There is no scroll-jacking, no scroll-scrubbed video, no forced smooth
  scrolling and no intro splash.
* Every touch target is at least 44 px, and the layouts start at 320 px.

Verified by rendering each route and auditing the HTML for `h1` count, duplicate ids, missing image
alt text and links without accessible names (all clean), plus a source audit for fixed widths that
could overflow a 320 px viewport (none).

---

## 10. Assets and their rights

Every image in `public/` — the ten film posters, the hero still and the five cinema-hall showcase
illustrations plus the auditorium still — is original artwork generated for this project. None is a
photograph of this venue and none is licensed film artwork. Full provenance, including the
placeholder checklist that must be completed before launch, is in **`ASSET_CREDITS.md`**.

**On reusing media from the owner's other repositories:** the owner also owns the GitHub accounts
`gireeshkumarreddy` and `divyashrma18` and asked for cinema-hall and film imagery to be taken from
them. That was investigated in detail and could not be done, for four documented reasons:

1. **No repository in either account has a LICENSE file**, so its media is all rights reserved and
   cannot be relicensed into this project.
2. Some repositories *do* document their own assets (`vara-studio`, `varasaree`, `Telangana-tech`),
   and that documentation is what made the audit possible — but the images are women's fashion
   editorial, sarees and Telangana government buildings. Wrong subject, and in `Telangana-tech`'s
   case CC BY-SA 4.0 share-alike obligations that a commercial venue site should not inherit.
3. The franchise repositories contain the material the brief explicitly prohibits. Inspection found
   `divyashrma18/harryPotter` shipping `house1–4.png`, `wand-cursor.svg` and a video, and
   `divyashrma18/avengers` shipping `a1–4.png` and `logo.png`.
4. **No repository contains current film key art**, and none could: film posters and stills belong to
   the distributor and reach a cinema site only through a studio-approved asset kit. A personal
   GitHub account cannot grant that permission.

The showcase was therefore built from original imagery, and `data/showcase.ts` is written so approved
venue photography and properly licensed film artwork can be dropped in later. See
`ASSET_CREDITS.md` §4.

Typography uses a system font stack: no webfont is downloaded, so there is no third-party font
request and no font licence dependency. Swap in a licensed face in `app/globals.css`
(`--font-display` / `--font-sans`) when the venue supplies one.

---

## 11. Review of the source repositories

The brief asked for specific patterns to be studied in a list of public repositories before building.
Those repositories were inspected, and the decisive finding is recorded in `ASSET_CREDITS.md`:

**None of the candidate repositories carries a LICENSE file.** Under the brief's own rule — code
without a licence is unavailable for copying — no source file, asset or asset path was copied from
any of them. The high-level ideas that informed this build (a restrained full-bleed hero with a text
scrim; typed local content separated from presentation; poster-led cards; filter state kept separate
from data; an enquiry form's honest failure states; offscreen video pausing as a principle applied
here by not shipping video at all) are reimplemented from scratch in this project's own code and
visual language. `ASSET_CREDITS.md` lists each repository reviewed and what was taken from it, which
in every case is "concepts only, no files".

---

## 12. Owner inputs required before launch

The full list is published on `/cinema` and `/help` as "Still being confirmed". In summary:

1. Confirmed cinema trade name, operator, and written approval for any mall attribution.
2. Official logo, brand colours and the production domain (`NEXT_PUBLIC_SITE_URL`).
3. Ticketing provider, its approved deep-link format, and the live showtime API or feed.
4. Verified address, entrance, box office hours, phone number and email.
5. Screen names, presenting formats, and confirmed accessibility provision.
6. Licensed poster/trailer assets and approved film copy for the current programme.
7. Approved promotions with dates and terms; approved refund/cancellation and privacy wording.
8. Confirmation of whether any analytics, cookies or customer contact collection is in scope.
