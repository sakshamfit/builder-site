# Asset credits and source provenance

This file records where every asset and every borrowed idea came from, as required by the project
brief. It is the audit trail for the site's rights position: if something here is wrong, it is wrong
in public and can be corrected.

**Summary: no third-party code, imagery, audio or video is included in this project.** Every source
file was written for this repository, and every image was generated for it. The repositories listed
below were reviewed for interaction ideas only.

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

All images are original, abstract artwork generated for this project with the Arena image tools.
They contain no real person, no real venue, no film title, no studio or brand mark and no logo.

These are **placeholders**. They are not photographs of this cinema and must not be presented as
such: the hero still is marked decorative for assistive technology and is captioned on the page as a
placeholder.

| File | Subject | Prompt summary | Used for |
| --- | --- | --- | --- |
| `public/stills/auditorium.jpg` | Empty auditorium, unlit screen | Dark premium auditorium, no people, no branding, no film imagery on screen | Home hero (decorative) |
| `public/posters/lantern-keeper.jpg` | Lit brass lantern in fog | Warm lantern light, deep charcoal, coral rim light | Sample film `lantern-keeper` |
| `public/posters/monsoon-circuit.jpg` | Rain on a dark window | Blurred amber city bokeh, noir mood | Sample film `monsoon-circuit` |
| `public/posters/nightshift-at-zero.jpg` | Concrete corridor, one lamp | One-point perspective, austere | Sample film `nightshift-at-zero` |
| `public/posters/paper-boats.jpg` | Paper boats on dark water | Low warm light, shallow depth of field | Sample film `paper-boats` |
| `public/posters/quiet-orbit.jpg` | Ring of light in darkness | Abstract orbit, restrained sci-fi | Sample film `quiet-orbit` |
| `public/posters/harbour-lights.jpg` | Harbour water at dusk | Reflected warm lights, romance mood | Sample film `harbour-lights` |
| `public/posters/the-long-interval.jpg` | Empty vintage auditorium | Soft glow from an unseen screen | Sample film `the-long-interval` |
| `public/posters/second-reel.jpg` | Curling 35mm film strip | Macro, dust and scratches, amber light | Sample film `second-reel` |
| `public/posters/static-and-stars.jpg` | Stars crossed by static | Deep black, coral signal line | Sample film `static-and-stars` |
| `public/showcase/screen-wall.jpg` | Blank screen between dark curtains | Warm screen glow, low angle | Cinema-hall showcase |
| `public/showcase/seats.jpg` | Rows of dark upholstered seats | Warm aisle light, shallow focus | Cinema-hall showcase |
| `public/showcase/foyer.jpg` | Dark foyer, low counter | Warm cove lighting, wide angle | Cinema-hall showcase |
| `public/showcase/concessions.jpg` | Dark concession counter | Amber under-shelf light, bokeh | Cinema-hall showcase |
| `public/showcase/corridor.jpg` | Entrance corridor | Line of light, one-point perspective | Cinema-hall showcase |

Each poster is 800 × 1200 (2:3) JPEG, metadata stripped. The hero still is 1376 × 768. All are
served through `next/image` with explicit `sizes` and are converted to AVIF/WebP at request time.
That conversion runs on `sharp`, which is therefore a production dependency rather than a build-time
extra.

### Iconography

`app/icon.svg` and the header wordmark are original vector drawings made for this project — a neutral
"screen light" glyph. They deliberately do not resemble any cinema chain's mark, and are intended to
be replaced by the official logo once the venue supplies it.

---

## 3. Required before launch

- [ ] Replace all ten placeholder images with licensed assets, or confirm in writing that the
      generated placeholders may remain on the public site.
- [ ] Replace the sample film catalogue (`data/movies.ts`) with the venue's approved programme, and
      record the licence for each poster and still here.
- [ ] Replace the header mark and `app/icon.svg` with the approved brand logo.
- [ ] Replace the five `public/showcase/` illustrations and the hero still with approved photographs
      of this cinema, and set `depictsVenue: true` in `data/showcase.ts` for each.
- [ ] If film key art is wanted, obtain each distributor's digital asset kit in writing and record
      the granted permission title by title here. Do not source it from any personal repository.
- [ ] If any trailer or video is added: confirm distribution rights, supply captions or a transcript,
      provide a poster fallback, keep it muted and user-initiated, and pause it when it scrolls out of
      view. (This build ships no video at all, because no licensed footage was available.)
- [ ] If a webfont is introduced: record its licence here and self-host it.
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

The cinema-hall showcase was built from **original generated imagery** (`public/showcase/`, plus the
existing `public/stills/auditorium.jpg`), which achieves the requested outcome — a venue-first
showcase of the hall — with no third-party rights exposure. The showcase's data layer
(`data/showcase.ts`) is written so that approved venue photography and, later, properly licensed
film key art can be dropped in: set `depictsVenue: true`, update `src`/`alt`/`caption`, and record
the photographer and licence in this file.

If the owner wants film artwork on the site, the correct route is to request the distributor's
digital asset kit for each title, and to record the granted permission here per asset. That is a
licensing step for the venue, not a development step.

## 5. What is deliberately absent

For the avoidance of doubt, this project contains:

* no franchise imagery, titles, characters, logos, music or footage;
* no studio or distributor artwork;
* no mall or operator logos;
* no scraped or hot-linked images (remote image patterns are disabled in `next.config.ts`);
* no analytics, advertising or tracking scripts;
* no credentials, API keys, Firebase configuration or demo user accounts from any source repository.
