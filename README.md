# Cinema at Madhuban — venue website

A mobile-first website that **showcases the cinema hall** at Madhuban, Bihar — the
auditorium, the screen, the seating, the foyer and the route from the mall to your seat — with the
film programme supporting that, rather than the other way round.

This is a venue showcase, not a booking engine. It shows the hall and tells you what is playing; when
you are ready, it hands you to the venue's ticketing partner to choose seats and pay.

> **Status: production-ready build, awaiting two inputs from the venue.**
> The site carries **no sample data of any kind.** The film programme is a real, sourced release
> calendar — actual films, actual announced release dates, each one cited — and the venue facts are
> the venue's own, with every unconfirmed item labelled as unconfirmed. What is still missing is the
> cinema's own timetable, which only its ticketing feed can supply, and photographs of its own
> interiors. Neither can be invented, and neither is.

---

## 1. Run it locally

```bash
npm install
npm run dev            # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run check` | Runs the project's self-checks (98 assertions) covering the sourced programme's provenance rules, timezone maths, schedule validation, the ticketing handoff rules, the venue feed contract, and the appearance system — palette parity, measured contrast on both sheets, and a scan that fails if any rule prints paper-coloured type on a fill. |
| `npm run feed:serve` | Starts a stand-in partner feed on `http://127.0.0.1:4100` so live mode can be exercised without a partner account. |
| `npm run build` | Production build. |
| `npm run lint` | ESLint (`eslint-config-next`). |
| `npm run typecheck` | `tsc --noEmit`. |

To run the site against the stand-in feed, which turns the schedule on:

```bash
npm run feed:serve     # terminal 1

NEXT_PUBLIC_DATA_MODE=live \
SCHEDULE_FEED_URL=http://127.0.0.1:4100/programme.json \
POSTER_HOST_ALLOWLIST=127.0.0.1 \
npm run dev            # terminal 2
```

Always run `npm run check` before changing anything in `lib/`. Several of the rules it protects —
everything to do with screening times, prices, availability and the booking handoff — are not
reachable through the UI until a feed is connected, so the checks are the only thing exercising them.

---

## 2. What is real, and what is genuinely not known yet

| Content | State |
| --- | --- |
| Films, languages, genres, release dates | **Real and sourced.** Held in `data/programme.json`, each entry citing at least one published release calendar. `npm run check` fails if any entry loses its sources. |
| Runtimes, certifications, synopses | **Absent, deliberately.** The sources used publish no runtime, certification or synopsis, so the record holds `null` rather than a plausible guess. These appear when a feed or the venue supplies them. |
| Screening times, screens, formats, prices | **Not available.** These are the venue's own operational data. They arrive only from its ticketing feed (`FEED_CONTRACT.md`). Until then the site says so, and shows nothing. |
| Town and state (Madhuban, Bihar) | **Confirmed — supplied by the venue owner.** This is the only address-level fact the site states plainly. |
| Street address, landmark and PIN code | **Not supplied** — rendered as an open question, never guessed. An address that stops at the town name will not get a visitor to the right door, and the site says so. |
| Google Maps search link for that address | Confirmed — a text search, **not** a pinned cinema entrance |
| Cinema trade name, logo, brand colours | **Not confirmed** — the site uses the working name "Cinema at Madhuban" and draws no logo |
| Screen names and count | **Not confirmed** — no auditorium list is published |
| Box office hours, phone, email, parking, transit, entrances | **Not confirmed** — rendered as "awaiting venue", never guessed |
| Accessibility provision | **Not confirmed** — listed item by item with its own verification state |
| Photographs of this cinema | **Not supplied** — the site therefore shows none, and substitutes none |
| Film artwork | **Original cover plates, generated for this project** (`data/cover-art.json`). Never a studio poster: no film's own key art appears anywhere on this site. |

### Why the gaps are published rather than filled

A cinema site is used to make travel and spending decisions. An unverified claim about step-free
access, an entrance, or a refund policy costs someone a wasted journey. So the project ships a
`Fact<T>` type (`lib/types.ts`) whose values are only rendered when `status === "confirmed"`; anything
else renders the owner's outstanding question instead (see `/cinema` → "Still being confirmed").

The same rule governs the film programme. A release date is a fact a source can be held to; a
national release date does not mean *this* cinema is screening the film, and the site says so on the
programme page, in the banner above it, and on every film page.

---

## 3. Project structure

```text
app/                      routes (App Router)
  page.tsx                home: cinematic opening → venue showcase → film programme → showtimes →
                          venue info → closing card
  movies/page.tsx         the programme; becomes a filterable schedule view with a feed
  movies/[slug]/page.tsx  one film: release facts, sources, and its screenings when they exist
  cinema/page.tsx         location, hours, facilities, accessibility, contact
  offers/page.tsx         approved promotions only
  help/page.tsx           booking handoff steps, FAQs, policies
  sitemap.ts robots.ts    generated from NEXT_PUBLIC_SITE_URL
components/
  layout/                 header, footer, primary nav, mobile dialog, day/night provider and switch
  showcase/               venue spotlight (ARIA tabs), highlights, gallery, photography-pending panel
  cinematic/              the opening sequence and its scenes, the media player, pause control,
                          reel dialog, intro and guided tour (adapted from pk — ASSET_CREDITS §11)
  home/                   prelude, scroll cue, showcase section, cinema experience, visit information
  programme/              the film programme: board, cards, typographic plate, schedule-wait panel
  movies/                 filter row
  showtimes/              date selector, film groups, screening chips, schedule status
  cinema/                 location, facilities, screens
  ui/                     button, badge, poster image, empty state, the two appearance glyphs
data/
  programme.json          SOURCED film programme: real titles, real release dates, real citations
  cover-art.json          the original cover plates in public/cover-art/
  media.ts                the original motion media in public/media/, with what each clip is made of
  showcase.ts             venue imagery registry (empty until approved photography arrives)
  cinema.ts               venue facts, each with a confirmation status
  offers.ts faqs.ts       approved content only
lib/
  programme.ts            loads, validates and cites the sourced programme
  feed.ts feed-source.ts  the partner feed contract and its validator
  schedule-source.ts      the one place that decides programme vs. feed
  ticketing-provider.ts   the single boundary to the ticket provider
  schedule.ts             validation and grouping
  showtime-view.ts        display models (all formatting happens here)
  date-format.ts          timezone-safe date/time/price formatting
  appearance.ts           day/night: the storage key, the rule, the pre-paint script
  motion.ts               easings and durations, checked against the stylesheet
  cinematic.ts            the motion pre-paint script, and the facts the cinematic scenes state
  playback.ts             one pause switch for every moving picture on a page
  types.ts site-config.ts clock.ts share-url.ts metadata.ts cinema-content.ts
scripts/checks.mts        self-checks (npm run check)
scripts/render-reel.mts   renders public/media/ from the cover plates (see §12)
ASSET_CREDITS.md          provenance for every asset and every idea borrowed
```

Every screen is a server component. The only client components are the mobile navigation dialog, the
venue spotlight, the marquee, the two navigation helpers that mark the current section, and the two
appearance pieces (the provider and the switch). The scroll cue is client-side too, and decorative.
On the home page the cinematic scenes are server components as well; what runs in the browser is the
scroll choreography, the media player, the pause control, the reel dialog and — behind `?showcase=1`
only — the guided tour. So the whole booking journey works with JavaScript disabled — without it the
page simply renders on the day sheet, the opening scene shows its still poster, the scenes read top to
bottom as ordinary sections, and each date/filter choice is a real, shareable URL.

---

## 4. The film programme

`data/programme.json` holds the films, and `lib/programme.ts` turns them into records the UI can
render. Two properties matter more than the others:

* **Every film is citable.** Each entry carries at least one `https` source, and the check suite fails
  the build if an entry loses one, gains a duplicate slug, or carries a release date that is not a
  valid calendar date. The sources are rendered to the visitor — on each film page, and as a footnote
  to the programme listing.
* **Nothing is filled in.** The record type has no field for runtime, certification, synopsis or
  artwork values that a release calendar does not publish. A check asserts that `data/programme.json`
  contains none of those keys at all, and that no parsed film claims a runtime, certification,
  synopsis or screening format. Adding a runtime by hand is not a shortcut here — it is a build
  failure, because it would be an unsourced claim about someone else's film.

Films are grouped by whether their release date has passed: *Recently released* and *Releasing soon*.
Both groups are statements about cinemas in India, not about this venue — the wording was chosen so
that neither can be read as "this cinema is showing this film" — and the board says so once at the top
rather than relying on the reader to infer it.

The check suite also guards the boundaries of the whole approach: it fails if `data/movies.ts`,
`data/showtimes.fixture.ts` or any of the placeholder image directories reappear, and if any app file
starts importing sample data again.

### Artwork

A film's poster belongs to the studio or distributor that commissioned it. Buying a ticket does not
buy a licence to reproduce one, and neither does a search result — so this site does not reproduce
any film's key art, and the card art you see is ours.

Each film either carries an **original cover plate** — an abstract composition in the site's own
palette, made for this project, listed in `data/cover-art.json`, sitting in `public/cover-art/` — or,
until its plate exists, a **typographic plate** (`components/programme/ProgrammePlate.tsx`) setting
the title in the display face over one of four flat brand treatments chosen deterministically from the
slug. Neither carries imagery, lettering, a logo, a likeness or a title treatment, so neither can be
mistaken for key art, and both are labelled in the interface and in their alt text.

The plate is a stand-in, and it admits it. When the venue supplies licensed artwork — through its own
asset kit, or from the partner feed's allow-listed CDN — `Movie.artwork` is set from that instead and
the plate disappears for that film. `ProgrammeCard` already prefers real artwork, so the swap needs no
code change, only a licence.

`npm run check` keeps the two halves of the arrangement honest: every slug in the manifest must have a
file, every file must be in the manifest, plates must stay inside a size budget, a programme film's
artwork must point at its own `public/cover-art/` path, and the alt text must say in words that the
image is not the film's poster. A remote poster URL on a programme film fails the build.

---

## 5. The cinema-hall showcase

The centrepiece of the site, and the reason it exists. It sits directly under the hero, ahead of
anything ticket-related, because the first question a venue site answers is "what is this place like?".

It currently renders the **photography-pending panel** (`components/showcase/VenuePhotographyPending.tsx`)
instead of a gallery. That is a deliberate choice, taken after an earlier build used original
generated illustrations of a generic auditorium: a picture of *some* cinema on *this* cinema's page
reads as documentation of this building, and it is not. So the panel lists what has been requested
from the venue, what is known for certain, and nothing in between.

* **`ShowcaseHighlights`** lists what the cinema offers as facts where the venue has confirmed them and
  as open questions where it has not: one confirmed line (its location inside the mall) and five
  marked "Awaiting venue".
* **`VenueSpotlight`** and **`VenueGallery`** are already wired for approved photography. Add files to
  `public/showcase/`, set `depictsVenue: true` and a real caption in `data/showcase.ts`, record them in
  `ASSET_CREDITS.md`, and both components switch on with no code change. Until then they render
  nothing at all — not a placeholder.

---

## 6. Design language

The site is built as an **editorial poster system** rather than a dark interface: cream paper stock,
near-black ink, one crimson accent, and an antique gold reserved for information that is still
unconfirmed. A fixed narrow rail runs down the left edge carrying a scroll-progress rule, a vertical
venue label and the percentage scrolled; the rest of the page is inset by its width, which is what
gives every screen a poster margin.

The signature device is the **specification sheet** (`components/cinema/SpecSheet.tsx`): ruled rows
pairing a small uppercase label with either a confirmed figure set in oversized display type or an
explicit statement of what is outstanding. It is the honesty model rendered as the visual centrepiece
— on `/cinema` the venue sheet reads *2 of 8 confirmed*, and the six open rows are visible, designed,
and each names the input that is missing.

Type is the other half of it: **Anton** set very large and very tight for display, against **DM Sans**
at 14px for body copy, with **Barlow** carrying labels and numerals. Everything above is expressed in
CSS custom properties in `app/globals.css`, so the palette and type scale can be retuned in one file.

**The night sheet.** The site prints in two inks: the cream poster by day, and the same poster
reversed — near-black stock, cream type, the crimson kept — after dark. The switch lives in the
header, the choice is remembered, and a visitor who has never touched it follows their operating
system. It is one attribute on `<html>` (`data-mode="night"`), set before first paint by a small
script so nobody gets a cream flash, and every surface on the site is painted from the tokens that
attribute redefines: no component contains a theme branch. Because the two sheets are the same
palette, the night values are measured, and `npm run check` recomputes their contrast ratios from the
stylesheet — a colour that fails AA is a failing build, not a matter of taste. (`--on-ink` and
`--on-dark` exist for the labels that sit *on* a fill rather than on paper: one inverts with its
surface, the other must not, and a scan in the check suite fails any new rule that confuses them.)

**The cinematic opening.** At the owner's direction the home page now opens the way the owner's
`gireeshkumarreddy/pk` site does: a full-screen film that, as the reader scrolls, contracts through a
circular mask into a ring of plates turning round the venue's name; a crimson arc sweeps past, house
velvet floods the stage for two lines of type, and it parts on a single framed plate — the next
release in the programme. A wide scene states the programme's size, a dark "season" scene gathers five
plates into a line beneath the programme's languages, three film chapters give the next releases the
full width, and a velvet end card closes the page. The choreography is pk's; every picture in it is
this site's own (the cover plates, and clips rendered from them — §12), and every number, date,
language and title is read from the same programme record the film pages use. The scenes are marked
`data-mode="night"` — the auditorium is dark whichever sheet the reader chose — so they paint from the
night tokens the check suite already measures; the one new colour is the velvet (`--curtain`), and its
labels are measured too. Over a dark scene the header and utility strip take the night palette, and
hand the reader's own sheet back when the page beneath them is light again.

Elsewhere, motion is limited to reveal-on-scroll for section blocks, short hover transitions, the
quiet scroll cue at the foot of the opening scene, and the crossfade between the two sheets.
The reveal is gated behind a `data-reveal="ready"` flag that only JavaScript sets, so if the script
never runs every section renders fully visible — content is never hidden behind an animation. The
cinematic scenes follow the same rule: their pinned, layered stage applies only once the controller
has set `data-live` on them. `prefers-reduced-motion: reduce` removes all of it, and disables the
marquee outright.

**Where this came from:** the owner directed that the visual layer follow their own repository,
`gireeshkumarreddy/kingfisher`. What was adapted, and what was deliberately left behind (its imagery,
trademarks, wording, Google Fonts links and scroll-driven centrepiece), is set out with reasoning in
`ASSET_CREDITS.md` §6.

The day/night system, the scroll cue and the prelude beneath the hero were adapted the same way from
the owner's own `gireeshkumarreddy/vistaRail`, at the owner's direction. That repository is Tailwind +
framer-motion + Lenis; none of that came across — each piece was re-implemented with this project's
tokens and its own, smaller, motion language. Its smooth-scroll dependency, its video crossfade, its
brand mark and its search field were deliberately left behind. `ASSET_CREDITS.md` §10 lists every
component, every change and every omission.

---

## 7. Data: how the programme and the schedule work

```text
data/programme.json ──► lib/programme.ts ──┐
                                           ├─► ScheduleSnapshot ─► view models ─► UI
lib/feed-source.ts ─► lib/feed.ts ─────────┘   (lib/schedule-source.ts)
  │  fetch + 8s timeout, validated
  └─► lib/schedule.ts  (validation and grouping)
```

There are exactly two sources and they answer different questions. The **sourced programme** answers
"what films exist and when do they open"; it carries no screenings, because a release calendar cannot
know what this cinema is showing. The **venue feed** answers "what is this cinema showing, when, on
which screen, at what price"; it is the only thing that can. `lib/schedule-source.ts` is the single
place that picks between them, and nothing is ever mixed.

* **A showtime is only rendered if it passes validation.** `validateShowtime` requires an ISO 8601
  timestamp **with an explicit UTC offset**, a known format, a known availability state, and a price
  only when a currency accompanies it. An unparseable or unfamiliar value is rejected, not coerced —
  coercion is how a site ends up claiming a format the venue never screens.
* **Records are cross-checked** against the catalogue and the venue record, so a screening can never
  reference a film, screen or venue that does not exist. Rejections are surfaced in development on
  `/movies` and are covered by `npm run check`.
* **No screening is ever inferred, priced or availability-claimed** by this project. Those fields are
  populated only from a validated provider payload; until one arrives, the site renders the
  schedule-wait panel instead of an empty timetable that could be read as "nothing is on".
* **Staleness is stated, not hidden.** `ScheduleStatus` shows the source and when the snapshot was
  produced, and escalates to "times may have changed — confirm with the cinema" once a snapshot is
  older than `SCHEDULE_STALE_AFTER_HOURS` (default 12). A stale schedule is labelled, not withdrawn.
* **Unlicensed artwork cannot reach a page.** A poster URL is accepted only from an allow-listed host,
  only when the payload declares the licence covering it, and only with alt text. Fail any of the
  three and the image is dropped, the film still lists, and the reason is logged. With an empty
  allow-list — the default — no remote artwork is accepted at all. `next.config.ts` derives its image
  `remotePatterns` from the same list, so the two cannot drift apart.

### Going live

There is no integration code left to write. Going live is configuration:

```bash
NEXT_PUBLIC_DATA_MODE=live
SCHEDULE_FEED_URL=https://<partner host>/<venue>/programme.json
POSTER_HOST_ALLOWLIST=<partner artwork CDN host>
SCHEDULE_FEED_TOKEN=<bearer token>        # only if the endpoint needs one
```

When `live` is set:

* the films, auditoriums and screenings all come from the payload, so there is no path by which a
  sourced release-calendar title can appear beside a feed title;
* the site-wide "screening times not published yet" banner disappears, and the schedule section
  becomes a date-and-screening chooser;
* the sitemap is built from the live catalogue, and film pages render on demand rather than being
  frozen into a build.

Live mode requires both switches: setting `NEXT_PUBLIC_DATA_MODE=live` without a `SCHEDULE_FEED_URL`
leaves the site on the sourced programme, because a mode whose only possible output is "the schedule
could not be read" is not a state worth shipping.

The payload shape, every enforced rule, the allowed enum values and the failure behaviour are
specified in **[`FEED_CONTRACT.md`](./FEED_CONTRACT.md)** — that is the document to send to the
ticketing partner. `lib/feed.ts` is its executable form, and `scripts/feed-fixtures.mts` contains one
deliberately broken payload per rule so every rejection path has a test.

If the feed is unreachable, returns a non-200, times out after 8 seconds, or fails validation, the
site renders "we could not read the cinema's schedule" while the venue information, the showcase and
the film programme keep working. It never falls back to sample data, and it never shows the last
payload forever without saying how old it is.

---

## 8. Booking handoff

`lib/ticketing-provider.ts` is the **only** place that knows how a visitor leaves to buy a ticket.
There is no seat map, no cart, no checkout and no confirmation page anywhere in this project — seat
selection and payment belong to the authorised provider.

A booking link is produced only when **all** of these hold:

1. the screening came from the venue's feed (nothing else in this project can produce a screening, so
   nothing else can produce a link);
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

The handoff carries the film, the **venue-local date**, the venue and (when the feed supplies one) the
provider's own screening id — verified in `npm run check`.

---

## 9. Dates, times and timezones

The venue operates in one timezone (`NEXT_PUBLIC_VENUE_TIMEZONE`, default `Asia/Kolkata`) while a
visitor's device may be in another. Therefore:

* showtimes are stored with explicit offsets and displayed in the **venue's** timezone;
* a 23:30 screening belongs to that calendar day, and a 00:45 screening belongs to the next one —
  grouping follows the venue's calendar, not UTC;
* nothing formats a time from the visitor's clock. `lib/showtime-view.ts` precomputes every display
  string on the server, so server and client markup cannot disagree and hydration is stable;
* `lib/clock.ts` is the single place that reads the wall clock, and it takes the timezone as an input.

---

## 10. Brand, attribution and never-claims

* The public name is configurable (`NEXT_PUBLIC_BRAND_DISPLAY_NAME`) and defaults to the neutral
  working title **"Cinema at Madhuban"**.
* **This site does not imply an official relationship** with the mall, any cinema chain or any
  operator. That is stated in the footer. An attribution line renders only when the operator supplies
  approved wording (`NEXT_PUBLIC_BRAND_ATTRIBUTION`).
* No brand marks, mall logos, film posters, stills or trailers from any source project or fan project
  ship here — see `ASSET_CREDITS.md`.
* The copy avoids unverifiable superlatives. There is no "largest", "best", "official", "exclusive",
  and no format claim (IMAX, 4DX, Dolby, ScreenX) unless the venue's own record states it.
* Artwork can only enter through two doors, and both are closed by default: an allow-listed partner
  CDN with a declared licence, or a file the venue itself supplies and licenses. `next.config.ts`
  derives its image `remotePatterns` from the allow-list, so a host cannot be reachable without the
  parser having accepted it.

---

## 11. Accessibility and motion

* Semantic landmarks, one `h1` per page, a skip link as the first tab stop, and visible focus rings
  that are never removed.
* Date selection, filters and every booking action are real links or buttons — operable by keyboard,
  announceable by screen reader, and functional with JavaScript disabled. Selection is exposed with
  `aria-current` (`="date"` on the date strip), not colour alone.
* The mobile menu is a modal dialog: focus moves in, is trapped, Escape closes it, focus returns to
  the toggle, and background scrolling is locked.
* The venue spotlight is a WAI-ARIA tabs widget with roving tabindex and arrow-key navigation; its
  captions are visible text, not tooltips.
* The programme plate is decorative (`aria-hidden`) with the film title rendered once as a real
  heading beside it, so a screen reader hears each title once, in a sensible outline.
* `prefers-reduced-motion: reduce` collapses every moving part of the site: reveals appear
  instantly, the marquee stops, the crossfade becomes a cut, the scroll cue is not rendered, the
  opening intro never starts, no video element is ever created (each clip's still poster is the
  picture), and the cinematic scenes are never pinned — they render as ordinary sections read top to
  bottom. The guided tour stays off, because a page that scrolls itself is motion.
* Without JavaScript the same plain layout is what renders: the intro is hidden by default and only
  the pre-paint script can show it, the posters are in the server HTML, and the pinned stage applies
  only once the controller has confirmed motion is welcome.
* The cinematic scenes scroll natively. Nothing listens to the wheel, nothing snaps and nothing smooths
  the scroll; the scrollbar is the only clock. The header, the skip link and the opening scene's
  "What's on" action — which jumps straight past the sequence to the programme — work at every point.
* Moving pictures are silent, start only when on screen, stop when scrolled away, when the tab is
  hidden or when a scene fades them out, and a fixed **Pause films** control (constant name, state in
  `aria-pressed`, remembered across visits) stops every film and every CSS loop on the page at once —
  the WCAG 2.2.2 mechanism. The reel dialog is a native modal `<dialog>`: focus moves in, Escape
  closes it, focus returns to its button, and the background films hold while it is open.
* The opening intro is the venue's name in type for about two and a half seconds, on the first
  home-page load of a visit only. It holds nothing: the first key, tap, click or scroll ends it, and it
  is hidden from assistive technology.
* Every touch target is at least 44 px, and the layouts start at 320 px.

Verified by rendering each route and auditing the HTML for `h1` count, duplicate ids, missing image
alt text and links without accessible names (all clean), plus a source audit for fixed widths that
could overflow a 320 px viewport (none).

---

## 12. Assets and their rights

**The site ships only artwork made for it.** The ten stand-in film posters and the six generated
cinema illustrations that this project once carried were deleted, along with the two data files that
held the sample films and the sample schedule, and `npm run check` fails if any of them reappear. What
ships instead is the set of original abstract cover plates (§4) and four clips of original motion
rendered from them (below). None of it is a film's key art, none of it depicts this building, and every
surface that shows it says so.

That is a deliberate position rather than an omission:

* **Film artwork** belongs to the studio or distributor and reaches a cinema website only through that
  distributor's approved asset kit or the ticketing partner's feed, with per-title permission. It
  cannot be searched for, scraped or substituted, and a stand-in that looks like a poster is worse
  than none at all — so each film card carries a typographic plate that names the gap.
* **Venue photography** must be of *this* building. A generated illustration of a generic auditorium
  reads as documentation and is not, so the venue showcase states what has been requested instead.

Both gaps close the same way: the venue supplies the asset, and it is recorded in `ASSET_CREDITS.md`
before it ships.

**On reusing media from the owner's other repositories:** the owner also owns the GitHub accounts
`gireeshkumarreddy` and `divyashrma18` and asked for cinema-hall and film imagery to be taken from
them. That was investigated in detail and could not be done, for four documented reasons:

1. **No repository in either account has a LICENSE file**, so its media is all rights reserved and
   cannot be relicensed into this project.
2. Some repositories *do* document their own assets (`vara-studio`, `varasaree`, `Telangana-tech`),
   and that documentation is what made the audit possible — but the images are women's fashion
   editorial, sarees and Telangana government buildings. Wrong subject, and in `Telangana-tech`'s case
   CC BY-SA 4.0 share-alike obligations that a commercial venue site should not inherit.
3. The franchise repositories contain the material the brief explicitly prohibits. Inspection found
   `divyashrma18/harryPotter` shipping `house1–4.png`, `wand-cursor.svg` and a video, and
   `divyashrma18/avengers` shipping `a1–4.png` and `logo.png`.
4. **No repository contains current film key art**, and none could: film posters and stills belong to
   the distributor and reach a cinema site only through a studio-approved asset kit. A personal GitHub
   account cannot grant that permission.

See `ASSET_CREDITS.md` §4.

**Code provenance is audited the same way.** All code here is original, with three owner-directed
exceptions from the owner's own repositories — the design language from `kingfisher` (§6), the
day/night system, scroll cue and prelude from `vistaRail` (§10), and the cinematic motion system from
`pk` (§11). None carries a licence file; none was copied verbatim; each section itemises what travelled
and what did not, and the permission runs to this project only.

**On the request to take the videos and content from `gireeshkumarreddy/pk`:** its code was adapted
(above, and §13); its media was not, and cannot be. Every image and clip in that repository is
promotional material for a released feature film — official stills and posters credited to the
production house, the film's title artwork, a real actor's likeness, and short clips published by the
film's music label — and pk's own README says that imagery, title marks and music belong to their
owners. A personal repository cannot license them to a commercial venue, and putting a film that is not
in this cinema's programme at the top of its home page would also tell visitors something false. The
check suite carries the SHA-256 fingerprint of every one of those 22 files and fails if any of them
appears anywhere under `public/`, under any name. `ASSET_CREDITS.md` §11 itemises what travelled.

**Motion media.** The four clips in `public/media/` — the 20-second title sequence (a landscape cut
and a portrait cut for phones), a 15-second gallery loop and a 10-second reel of turning rings — are
rendered frame by frame by `scripts/render-reel.mts` from the cover plates and from shapes the script
draws: a projector beam, dust in the light, a velvet curtain, a turning reel. No camera footage, no film
footage, no lettering, no faces. Each clip, its poster, its dimensions, its running time and the plates
it is made from are recorded in `data/media.ts`, and the check suite reads each MP4's own header to
confirm they agree. To rebuild them (the renderer's two dependencies are deliberately not part of the
site's install):

```bash
npm install --no-save @napi-rs/canvas
FFMPEG=/path/to/ffmpeg npx tsx scripts/render-reel.mts     # or with ffmpeg on PATH
npx tsx scripts/render-reel.mts --stills                     # review frames in /tmp/reel-stills
```

Real footage reaches the site the same way real posters do: the venue supplies its own walkthrough
film with a written licence, or a distributor supplies a trailer in writing for a title this cinema is
actually screening — recorded as a new entry in `data/media.ts` and in `ASSET_CREDITS.md` first.

Typography is self-hosted and OFL-1.1 licensed (**Archivo** for display, **Inter** for body copy,
**JetBrains Mono** for labels, times and prices), installed as npm packages so nothing is fetched from
a font CDN at runtime. Licences and swap instructions are in `ASSET_CREDITS.md`.

---

## 13. Review of the source repositories

The brief asked for specific patterns to be studied in a list of public repositories before building.
Those repositories were inspected, and the decisive finding is recorded in `ASSET_CREDITS.md`:

**None of the candidate repositories carries a LICENSE file.** Under the brief's own rule — code
without a licence is unavailable for copying — no source file, asset or asset path was copied from any
of them. The high-level ideas that informed this build (a restrained full-bleed hero; typed local
content separated from presentation; poster-led cards; filter state kept separate from data; an
enquiry form's honest failure states; offscreen video pausing, now applied in the site's own media
player) are reimplemented from scratch in this project's own code and visual language.
`ASSET_CREDITS.md` lists each repository reviewed and what was taken from it, which in every case is
"concepts only, no files".

**Two documented exceptions, both the owner's own repositories and both owner-directed.** First, the
visual layer follows `gireeshkumarreddy/kingfisher` ("just clone the repo and then customize it"): its
design system — palette, fixed left rail, display-type treatment, bordered specification sheets,
filter row, full-screen menu and reveal-on-scroll — was adapted into this project. Its imagery,
trademarks, wording, Google Fonts links and scroll-driven sticky centrepiece were not. Second, at the
owner's instruction components were taken from `gireeshkumarreddy/vistaRail` — the day/night
appearance system, the scroll cue and the prelude beneath the hero. Its Tailwind theme, framer-motion
dependency, Lenis smooth scrolling, video crossfade, brand mark, search field and copy did not travel;
each piece was re-implemented against this project's tokens. Third, at the owner's instruction the
videos, components and effects of `gireeshkumarreddy/pk` were brought across — and here the line ran
through the middle of the repository: its GSAP choreography, layered media player, pause control,
dialog, intro and guided tour were adapted; every piece of its media (a released film's stills,
posters, title art and label-published clips) and all of its copy were not, and its Tailwind, shadcn
and YouTube layers were left behind. What was taken, what was changed and what was left behind is
itemised in `ASSET_CREDITS.md` §6, §10 and §11.

---

## 14. Production configuration

Every value below is an owner or operator decision. The defaults are chosen so the site fails closed
rather than guessing. `lib/site-config.ts` reads them; `.env.example` is the template.

| Variable | Default | What it controls |
| --- | --- | --- |
| `NEXT_PUBLIC_BRAND_DISPLAY_NAME` | `Cinema at Madhuban` | The working display name. One string — it flows into the header, hero, footer, page titles and metadata. |
| `NEXT_PUBLIC_BRAND_ATTRIBUTION` | empty | Operator/mall attribution. Empty means no attribution line is shown, because an unapproved one implies a relationship the venue has not granted. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URLs, sitemap and social previews. **Must be set before launch or the sitemap advertises the wrong domain.** |
| `NEXT_PUBLIC_VENUE_TIMEZONE` | `Asia/Kolkata` | How screening times are displayed. Not a data field — records carry their own offset. |
| `NEXT_PUBLIC_DATA_MODE` | `programme` | `programme` serves the sourced release calendar and states that screening times are not connected. `live` renders the partner feed, and is only entered when `SCHEDULE_FEED_URL` is also set. |
| `SCHEDULE_FEED_URL` | empty | **Server-only.** The partner payload. See `FEED_CONTRACT.md`. |
| `SCHEDULE_FEED_TOKEN` | empty | **Server-only.** Bearer token, if the endpoint needs one. Never reaches the browser. |
| `POSTER_HOST_ALLOWLIST` | empty | Comma-separated artwork hosts. Empty means **no remote artwork is accepted**. Also drives next/image `remotePatterns`, so the two cannot disagree. |
| `SCHEDULE_STALE_AFTER_HOURS` | `12` | Age at which a payload is labelled stale. |
| `SCHEDULE_REVALIDATE_SECONDS` | `300` | How long a fetched payload may be reused before re-fetching. |
| `NEXT_PUBLIC_TICKETING_PROVIDER_NAME` | empty | The provider's name on the handoff button. Empty means **no booking button is rendered at all**. |
| `NEXT_PUBLIC_TICKETING_URL_TEMPLATE` | empty | Deep-link template with `{movieId}`, `{date}` and `{venueId}`. Must be `https`. |
| `NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS` | empty | Hosts the template may resolve to. A link resolving anywhere else is refused. |

### Deployment order

1. Set `NEXT_PUBLIC_SITE_URL` to the real domain. Until then the sitemap and canonical links point at
   `localhost`, which is wrong in public.
2. Deploy as-is. The sourced programme is real data and is safe to serve and to index: every film
   carries the sources behind its release date, and every public claim about the venue is either
   confirmed by the owner or labelled outstanding.
3. Connect the ticketing provider last: `SCHEDULE_FEED_URL`, `POSTER_HOST_ALLOWLIST`, then flip
   `NEXT_PUBLIC_DATA_MODE=live`. Flip it only when the payload passes validation — a live schedule
   over a broken feed is worse than an honest "not connected" panel.

---

## 15. Owner inputs required before launch

The full list is published on `/cinema` and `/help` as "Still being confirmed". In summary:

1. Confirmed cinema trade name, operator, and written approval for any mall attribution.
2. Official logo and brand colours — the site currently shows type only and draws no mark, by decision.
   Send files for `public/brand/` when ready. Also the production domain (`NEXT_PUBLIC_SITE_URL`).
3. Ticketing provider, its approved deep-link format, and the live showtime API or feed — see
   `FEED_CONTRACT.md`.
4. Verified address, entrance, box office hours, phone number and email.
5. Screen names, presenting formats, and confirmed accessibility provision.
6. **Approved venue photography**, and licensed poster assets for the films it is screening.
   *Runtimes and certifications per film also arrive with the feed.*
7. Approved promotions with dates and terms; approved refund/cancellation and privacy wording.
8. Confirmation of whether any analytics, cookies or customer contact collection is in scope.
