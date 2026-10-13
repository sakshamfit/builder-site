# Asset credits and source provenance

This file records where every asset and every borrowed idea came from, as required by the project
brief. It is the audit trail for the site's rights position: if something here is wrong, it is wrong
in public and can be corrected.

**Summary: no third-party code, imagery, audio or video is included in this project — and, as of the
current build, no first-party placeholder imagery either.** The site ships no images at all: the
generated posters and cinema illustrations that an earlier build carried have been deleted, because a
stand-in that reads as a photograph of this cinema, or as a film's own poster, is worse than no image.
Every asset that will appear on this site has to arrive with its licence attached. The repositories
listed below were reviewed for interaction ideas only, with one documented exception: the visual
design language is adapted from a repository owned by the same owner, at the owner's instruction. See
§6.

---

## 1. Code provenance

All source code in this repository is original to this project. No file was copied, translated or
adapted from another repository.

### Repositories reviewed before building

The brief named a set of repositories to study. They were inspected at the start of this work, and
the licence position was checked first, because it determines whether study is even possible:

```bash
curl -s https://api.github.com/repos/<owner>/<repo> | python3 -c \
  'import sys,json; d=json.load(sys.stdin); l=d.get("license"); print((l or {}).get("spdx_id","NO LICENSE FILE"))'
```

| Repository | Licence reported by the GitHub API | What was taken |
| --- | --- | --- |
| `gireeshkumarreddy/vistaRail` | **No licence file** | Concepts only. A restrained full-bleed hero with a text scrim, a single primary action, a documented reduced-motion fallback, and a shared easing token. Reimplemented from scratch; no markup, CSS, component or asset was copied. |
| `gireeshkumarreddy/-Gireesh-Portfolio` | **No licence file** | Concepts only. Content separated into typed local data, page/section composition, metadata organisation. |
| `gireeshkumarreddy/AVENGERS-DOOMSDAY-` | **No licence file** | Concepts only. Poster-card data shapes and DOM layering discipline. Its scroll-scrubbed master timeline, video choreography and franchise theme were deliberately **not** adopted. |
| `gireeshkumarreddy/hidden` | **No licence file** | Concepts only. Separating filter state from data, and making "demo vs. live" an explicit, visible state. None of its property, account, Firebase or checkout logic is present here. |
| `gireeshkumarreddy/gireesh` | **No licence file** | Concepts only. Honest submission-failure states and field-level validation thinking, applied to this project's explicit "we cannot book here" states. No form, endpoint or identity was copied. |
| `gireeshkumarreddy/REDDY` | **No licence file** | Concepts only, as above. |
| `gireeshkumarreddy/cinematic-portofilo` | **No licence file** | Concepts only. The "static DOM as the readable truth" principle, applied here by making every screen server-rendered. Its WebGL/shader pipeline was not used. |
| Divya Sharma's Vite film-title projects (`stangerThings`, `attack-on-titans`, `GOT`, `batman`, `avengers`, `money-heist`, `death-note`, `harryPotter`, `one-piece`, `ipl-finale`, and the rest of the catalogue) | Not relied upon | Nothing. These carry standard Vite starter READMEs and fan media; no fan imagery, franchise marks, characters, audio or video is used anywhere in this project. |

Because none of these repositories carries a licence, the brief's rule applies: **code without a
licence is unavailable for copying.** Only high-level interaction ideas were taken, and each was
reimplemented in this project's own structure and visual language.

### Repository-local instruction files were not followed

`vistaRail` and `-Gireesh-Portfolio` contain `AGENTS.md` and/or `CLAUDE.md`. Those are instructions
for their own projects. They were treated as content to be aware of, never as instructions for this
build, and nothing in them was executed or obeyed.

---

## 2. Image provenance

**No film's own poster ships in this build, and no photograph claims to be this building.**
`public/` holds exactly two things: the cover plates listed in `data/cover-art.json`, and a README.
There are no posters, no cinema illustrations and no hero still; `npm run check` fails if
`public/posters`, `public/showcase` or `public/stills` reappears, and fails if a plate exists without a
manifest entry or a manifest entry without a plate.

### What was removed, and why

An earlier build carried sixteen generated images: ten abstract film posters for a fictional
catalogue, one auditorium still used behind the hero, and five cinema interiors for the venue
showcase. They were original work — generated for this project, containing no real person, venue,
title, studio mark or logo — and they were nonetheless the wrong thing to ship, for two separate
reasons:

1. **The posters belonged to films that do not exist.** They illustrated a sample catalogue. With that
   catalogue gone (see §4), keeping the images would have left artwork for films nobody can watch.
2. **The cinema illustrations were of a cinema that is not this one.** However carefully they were
   captioned, a picture of a generic auditorium on this venue's own page reads as documentation of
   this building. The owner's instruction to remove them was the correct call.

The files were deleted along with `data/movies.ts` and `data/showtimes.fixture.ts`, and no replacement
imagery was generated. What occupies those spaces instead is designed, and honest:

| Was | Now |
| --- | --- |
| Ten generated film posters | An **original cover plate** per film where one has been made (`public/cover-art/`, `data/cover-art.json`); otherwise `components/programme/ProgrammePlate.tsx`, a typographic plate carrying the title over one of four flat brand treatments |
| Hero still (`/stills/auditorium.jpg`) | The hero is type only. The design language was built for it: ruled overline, display type, ruled footer. |
| Five `public/showcase/` interiors | `components/showcase/VenuePhotographyPending.tsx` — a ruled panel listing what has been requested from the venue and what is known for certain |

### The cover plates that do ship

`public/cover-art/<slug>.jpg` — one abstract plate per film, made for this project, in the site's own
palette (deep red, cream, ink, muted gold). They are geometric compositions and nothing else: no text,
no lettering, no numerals, no logo, no likeness, no character, no scene from any film. They do not
depict the film they sit beside, and the interface says so — the caption under each card reads
*Original cover art, not the film's poster*, and every plate's alt text says the same thing in words.

Their job is to give the programme the shape a cinema programme has, without borrowing anything. They
are a stand-in with a stated limitation, not a claim to be key art.

| Property | Value |
| --- | --- |
| Author | Generated for this project for this repository |
| Licence | Original work made for this project — see `data/cover-art.json` |
| Contents | Flat geometric forms in the brand palette only |
| Declared in | `data/cover-art.json` (manifest), `public/cover-art/` (files) |
| Replaced by | A licensed poster, automatically, when the venue or the partner feed supplies one |

### How imagery gets back in

Two doors, both requiring something this project cannot manufacture:

* **Venue photography** — approved photographs of this building, supplied by its owner. Drop the files
  into `public/showcase/`, set `depictsVenue: true` with a real `alt`, caption and provenance in
  `data/showcase.ts`, and record the photographer and licence here. `VenueSpotlight` and
  `VenueGallery` are already wired to render them; until then they render nothing.
* **Film artwork** — posters, key art and stills belong to the studio or distributor. They reach a
  cinema website through that distributor's approved asset kit, or through the ticketing partner's
  feed as an allow-listed CDN URL with a declared licence (`lib/feed.ts` refuses anything else). They
  cannot be searched for, scraped or substituted, and no stand-in will be generated for them.

### Typography

Four self-hosted font files, all under the **SIL Open Font License 1.1**, which permits commercial
use, modification and redistribution provided the licence travels with the font files. They are
installed as npm packages and bundled by Next.js, so no third-party font request is made at runtime
and no licence obligation is left behind in a CDN.

| Package | Family | Axes | Role | Licence |
| --- | --- | --- | --- | --- |
| `@fontsource/anton` | Anton | Regular 400 | Display: the venue name, film titles, section headings and screening times — condensed, heavy, uppercase | **OFL-1.1** |
| `@fontsource/barlow` | Barlow | 400 / 600 / 700 | Interface: eyebrows, navigation, buttons, badges, small labels | **OFL-1.1** |
| `@fontsource/barlow-condensed` | Barlow Condensed | 600 | Numerals: schedule counts and tabular figures | **OFL-1.1** |
| `@fontsource-variable/dm-sans` | DM Sans Variable | Weight | Body copy, captions, policy text and everything long | **OFL-1.1** |

Each package carries its own `LICENSE` file inside `node_modules`, and the licence text is available
at https://openfontlicense.org. The fonts are used unmodified — only the variable axis is set in CSS,
and Anton is used as shipped in its single weight — so no renamed variant needs to be published.

The reference used to choose these faces (see §6) loaded Yatra One and Noto Sans Indic from Google
Fonts at runtime. **That was not carried over**: this project self-hosts every face, which is why the
faces above are installed as packages rather than linked.

Replacing them is a two-line change in `app/layout.tsx` plus the `--font-*` tokens in
`app/globals.css`.

### Artwork arriving through the venue feed

In live mode, film artwork is supplied by the ticketing partner and this site
enforces three conditions before a single image is displayed: the host must be on
`POSTER_HOST_ALLOWLIST`, the payload must carry an `artworkLicence` statement
naming the agreement that covers it, and the image must have alt text. Fail any of
the three and the poster is dropped while the film still lists — the failure mode
is "no image", never "someone else's image". With an empty allow-list, which is the
default, no remote artwork is accepted at all. See `FEED_CONTRACT.md` §3.

The placeholder posters served by `scripts/feed-server.mts` (used by
`npm run feed:serve` to exercise the pipeline locally) are generated by that script
from a shape drawn here: a plain bordered tile carrying the words
"placeholder artwork / not a film poster". They are never written to `public/`, are
never part of a production build, and carry no brand or film imagery.

### Iconography

**This site displays no logo.** It identifies itself with type only — the venue's name set in Anton,
positioned by the layout. There is no monogram, stamp, seal or drawn mark in the header, the left
rail, the footer or on share cards. The venue has not supplied a logo, and a neutral mark invented
here would be a claim about a brand identity the cinema has not approved.

The one exception is `app/icon.svg`, the browser favicon: a plain, identity-free glyph kept because a
missing favicon renders as a broken-tab icon. It is a browser affordance rather than branding, and it
is to be replaced with the approved mark in the same step as the logo. `public/brand/README.md`
documents the handover.

---

## 3. Required before launch

- [x] Sample films, sample screenings and all placeholder imagery deleted. The programme is now real
      and sourced (`data/programme.json`), and `npm run check` fails if any fixture file or stand-in
      image directory returns.
- [ ] Supply the venue's own screening times. They come from the ticketing partner's feed — see
      `FEED_CONTRACT.md` for the payload this site expects, which is the same shape any Indian
      exhibitor listing already exposes to aggregators.
- [ ] Supply approved photographs of this cinema for `public/showcase/`, and set `depictsVenue: true`
      with a real caption and provenance in `data/showcase.ts`. Record the photographer here.
- [ ] Supply the confirmed trade name as a string, and the logo file(s) if a mark is wanted. The site
      currently draws **no logo at all**, by the owner's decision; `app/icon.svg` (favicon) is the
      sole identity-free glyph.
- [ ] If film key art is wanted, obtain each distributor's digital asset kit in writing and record
      the granted permission title by title here. Do not source it from any personal repository, and
      do not treat a search engine result as a licence.
- [ ] Per-film runtimes and certifications. These are not published by release calendars, so they are
      `null` throughout the programme until a feed or the venue supplies them.
- [ ] If any trailer or video is added: confirm distribution rights, supply captions or a transcript,
      provide a poster fallback, keep it muted and user-initiated, and pause it when it scrolls out of
      view. (This build ships no video at all, because no licensed footage was available.)
- [x] Self-hosted, OFL-1.1 licensed webfonts in use (Anton, Barlow, Barlow Condensed, DM Sans
      Variable) — recorded above. No font is loaded from a CDN.
- [ ] Confirm that no third-party map embed, analytics script or tag manager is added without the
      corresponding privacy wording and owner approval.

---

## 4. A note on reusing media from the owner's own repositories

The venue owner also owns the GitHub accounts `gireeshkumarreddy` and `divyashrma18`, and asked for
cinema-hall imagery and current film imagery to be taken from those repositories. That request was
investigated directly rather than assumed, and the outcome is recorded here because it is a rights
decision, not a preference.

**Finding 1 — no repository in either account carries a LICENSE file.** Without one, the default is
all rights reserved, so code and media from those repositories cannot be relicensed into this
project. (This is the same finding that governs the code audit in section 1.)

**Finding 2 — some repositories do document their own asset provenance, and that documentation is
what makes reuse *possible* elsewhere but not *suitable* here:**

| Repository | Its own provenance record | Why it was not used |
| --- | --- | --- |
| `gireeshkumarreddy/vara-studio` | `ASSET_PROVENANCE.md`: photographs downloaded from Unsplash under the Unsplash License, with photographer, page URL and image id listed; "Credit is not required by the licence but is given" | The images are women's fashion editorial photographs. Wrong subject for a cinema hall, and carrying them into this project would move a third-party licence obligation (and a brand context) into a venue site for no benefit. |
| `gireeshkumarreddy/varasaree` | `ASSET_PROVENANCE.md`: nine images generated with the built-in image tool, with the exact prompt set recorded | Original AI images, but of Indian sarees — wrong subject. The *practice* here is the model this project followed: generate original images and record the exact prompts. |
| `gireeshkumarreddy/Telangana-tech` | `CREDITS.md`: two Wikimedia Commons photographs under **CC BY-SA 4.0** with full attribution, plus several Unsplash illustrative photographs | CC BY-SA 4.0 is a share-alike licence. Importing one into a commercial venue site would impose attribution and share-alike obligations, and the photographs show a government secretariat and Hyderabad — not this cinema. |
| `gireeshkumarreddy/alluarjun`, `Bahubali`, `pk`, `one-piece-`, `AVENGERS-DOOMSDAY-`, `Ghost-Rider-`, `GIRL`, `cinematic-portofilo` | Asset source notes exist in some, but the media is franchise material | Fan-project material. Franchise imagery cannot be relicensed by anyone other than the rights holder, regardless of who owns the repository. |

**Finding 3 — the franchise repositories contain exactly the material that must not ship.** Direct
inspection found, for example:

- `divyashrma18/harryPotter` → `vite-project/public/images/house1.png` … `house4.png`, `wand-cursor.svg`, `video/one.mp4`
- `divyashrma18/avengers` → `vite-project/public/images/a1.png` … `a4.png`, `logo.png`

These are the visual identity of two of the largest film franchises in the world. Shipping them on a
commercial cinema site would be trademark and copyright infringement, and the brief prohibits it in
terms: *"All franchise imagery, official logos, posters, trailers, music, characters and trademarked
content unless the cinema has explicit rights."*

**Finding 4 — "current movie launch" imagery cannot come from these repositories at all.** No
repository in either account contains current film key art. Searching them could not produce it,
because film posters and stills are the property of the distributor. They reach a cinema website only
through a studio-approved marketing asset kit or the ticketing partner's feed, with per-title and
per-territory permission. Nothing in a personal GitHub account can grant that.

### What was done instead

The cinema-hall showcase was first built from **original generated imagery**, which achieved a
venue-first showcase of the hall with no third-party rights exposure — but which illustrated a
generic cinema rather than this one, and was removed for that reason (see §2). The showcase now
presents the venue's confirmed facts and its outstanding questions, and is empty of imagery until the
venue supplies photographs of its own building. `data/showcase.ts` is written so those photographs and,
later, properly licensed film key art drop straight in: set `depictsVenue: true`, update
`src`/`alt`/`caption`, and record the photographer and licence in this file.

If the owner wants film artwork on the site, the correct route is to request the distributor's
digital asset kit for each title, and to record the granted permission here per asset. That is a
licensing step for the venue, not a development step.

## 5. What is deliberately absent

For the avoidance of doubt, this project contains:

* no franchise imagery, titles, characters, logos, music or footage;
* no studio or distributor artwork;
* no mall or operator logos;
* no scraped or hot-linked images — `next.config.ts` derives its permitted remote artwork hosts
  from `POSTER_HOST_ALLOWLIST`, which is empty by default, so no remote host is reachable at all;
* no analytics, advertising or tracking scripts;
* no credentials, API keys, Firebase configuration or demo user accounts from any source repository.

---

## 6. Design language

The visual system was adapted from a repository owned by the same owner,
[`gireeshkumarreddy/kingfisher`](https://github.com/gireeshkumarreddy/kingfisher), at the owner's
direct instruction ("just clone the repo and then customize it"). Because the repository is the
owner's own work and the adaptation was explicitly requested, it is recorded here as the one case in
this project where a pattern was taken from an existing source rather than invented.

### What was adapted

| Device in the reference | Reimplemented here as |
| --- | --- |
| Cream paper, deep red, near-black ink and a restrained antique gold | The site palette in `app/globals.css`. Red is reserved for the primary action and the footer; gold marks *unconfirmed* states; ink carries structure. The specific hexes were darkened where the reference's values failed WCAG AA as text on paper. |
| A fixed narrow left rail holding a mark, a scroll-progress rule and a vertical label; the page inset by its width | `components/layout/Rail.tsx`. Percentage of page scrolled is shown as a tabular numeral rather than a decorative rule alone. |
| Oversized condensed uppercase display type over a small body size | Anton for display, DM Sans at 14px for body, Barlow for labels. All sizing is in `clamp()` so the display voice scales from 320px to a wide desktop. |
| Full-viewport opening scene with the title set as large as the viewport allows and a ruled overline and footer | `components/home/Hero.tsx`. The title lines are derived from the configured brand name rather than hard-coded. |
| A bordered "spec sheet" of small uppercase labels paired with large display values | `components/cinema/SpecSheet.tsx`, which turns the venue's confirmed/pending fact model into ruled rows. This is the device the honesty system most benefits from: an unconfirmed fact is a visible, designed row rather than an absence. |
| Text-button filter row with an accent underline on the active item and a superscript count | `components/movies/MovieFilters.tsx`, restyled in `movies.module.css`. |
| Reveal-on-scroll (opacity and translate, `cubic-bezier(.16,1,.3,1)`), progressive-enhancement gated | `components/layout/RevealProvider.tsx`. Gated behind a `data-reveal="ready"` flag set only when JavaScript is available, so no content can ever be stranded behind an animation. |
| Full-screen menu that slides down over the page in the accent colour | `components/layout/FullScreenMenu.tsx`, rebuilt as a proper modal: focus trap, Escape to close, focus returned to the toggle, background scroll locked. |

### What was deliberately not taken

The reference is a beer brand concept page, and the parts of it that carry that identity are not
reusable here:

- **No imagery, product cut-outs or marks.** `dist/assets/*.jpg`, `*-cut.webp`, `premium.png`,
  `ultra.png`, `max.webp`, `witbier.webp`, `mango.png`, `lemon.png`, `food.jpg`, `glass.jpg` and
  `brand-stamp.svg` are all excluded. The reference's own README states that all trademarks and
  images remain the property of their respective owners, and its credits name Kingfisher Drinks /
  United Breweries and several retail partners. None of that travels with the design system.
- **No words.** No heading, caption, product name or footer line was carried across.
- **No Google Fonts.** The reference links Yatra One and Noto Sans Indic from `fonts.googleapis.com`;
  this project self-hosts instead. See the Typography section above.
- **No Devanagari display face as a decorative motif.** Different brand, different region, different
  meaning.
- **No scroll-driven sticky sequence.** The reference's centrepiece is an element held with
  `position: sticky` while a long track scrolls past it. That is exactly the "pinned giant scroll
  experience" the brief prohibits, so it was not rebuilt in any form.
- **No audio, particles, pointer-only interactions or animated cursor.** The reference's petal
  shedding, diyas and pour interaction are pointer- and sound-driven; here, motion is limited to
  CSS opacity and transform effects that the global `prefers-reduced-motion` rule removes entirely.

### Licence position

The repository carries **no LICENSE file** (the same finding as every other repository reviewed for
this project, recorded in §1). That would normally mean code unavailable for copying, and it is why
the other repositories contributed ideas only. This one is the owner's own repository and the
adaptation was explicitly directed by the owner, so it is permitted here — but only for the owner,
and only for this project. If any part of this codebase is ever reused elsewhere, the design language
in this section must be re-checked against the same rule.

---

## 7. Programme data provenance

`data/programme.json` holds the film programme. It is the one place in this project where facts about
the outside world are recorded, so its provenance is written down here as well as beside each film.

**What it contains:** real films with announced theatrical release dates for cinemas in India,
compiled on 13 October 2026 from published release calendars and film-trade listings. Each film carries
the sources it was compiled from, as `https` URLs; `npm run check` fails the build if an entry loses
its sources, gains a duplicate slug, or carries a date that is not a valid calendar date.

**What was taken from those sources:** the film's title, its language or languages, its genre
classification, and its announced release date. Nothing else. No synopsis, no runtime, no
certification, no cast list and **no image** was copied from any of them — a check asserts that
`data/programme.json` does not even contain those keys.

**What that means for rights:** a film's title, language, genre and release date are facts. Facts are
not copyrightable, they are reported by every listings site, and a cinema publishing what is opening
this month is the ordinary use of them. Poster images, stills and trailers are a different matter
entirely: they are the distributor's property, and they are not taken here.

**How to add a film:** add an entry with a published release date and at least one `https` source.
The record type deliberately has no field for a runtime, a certification, a synopsis or an image URL,
so there is nowhere to put an invented one.

---

## 8. Opening intro: video and component source (licence to be confirmed)

The site now opens with a scroll-scrubbed intro, `components/ui/scroll-locked-video-hero.tsx`, shown over
the home page on each visit until the reader pushes through it (`components/layout/SiteIntro.tsx`).

| Asset | Source | Licence position | Status |
| --- | --- | --- | --- |
| Intro video (default `videoSrc`) | `https://cdn.21st.dev/assets/mirror/21/21a77eac…066c0f.mp4` | **Not verified.** It is a third-party stock clip of a city, not footage of Madhuban or of this cinema, and no licence for it has been recorded. | **Must be cleared or replaced before launch.** Replace by passing the owner's own footage as `videoSrc` (self-hosted under `public/`), or remove the intro with `SiteIntro`. |
| Intro component code | Adapted from a 21st.dev component snippet supplied by the project owner | Licence not stated in the snippet. It has been adapted (fonts, release path, skip control), not copied verbatim. | Confirm the upstream licence. Its author credit line ("by guglielmogiannattasio.exe") is kept on screen until it is cleared. |

This is the only third-party video on the site. The intro never depicts this cinema, and it is not a
photograph of the venue.

---

## 9. Footer crowd: sprite and licence (to be confirmed)

The footer carries a crowd of walking figures, `components/ui/skiper39.tsx` (`CrowdCanvas`), rendered in a strip beneath the footer copy.

| Asset | Source | Licence position | Status |
| --- | --- | --- | --- |
| Crowd sprite (figures, 15 × 7 grid) | `https://cdn.21st.dev/assets/localized/abdb8990….png`, illustration by openpeeps | Skiper UI free licence: free to use and modify, **attribution to Skiper UI required**. Attribution is printed in the footer. | **Host the file under `public/` before launch** so the site does not depend on a third-party CDN, and confirm the illustration's own licence with openpeeps. |
| Animation code | Adapted from Skiper UI "Canvas_Landing_004", itself inspired by a CodePen by zadvorsky | Same Skiper UI free licence; attribution as above. | Attribution in the footer. |

The animation uses `gsap` (MIT licence). It is not used when the visitor has asked for reduced motion.
