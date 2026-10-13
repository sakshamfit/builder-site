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
- [ ] If any trailer or video is added: confirm distribution rights, supply captions or a transcript,
      provide a poster fallback, keep it muted and user-initiated, and pause it when it scrolls out of
      view. (This build ships no video at all, because no licensed footage was available.)
- [ ] If a webfont is introduced: record its licence here and self-host it.
- [ ] Confirm that no third-party map embed, analytics script or tag manager is added without the
      corresponding privacy wording and owner approval.

---

## 4. What is deliberately absent

For the avoidance of doubt, this project contains:

* no franchise imagery, titles, characters, logos, music or footage;
* no studio or distributor artwork;
* no mall or operator logos;
* no scraped or hot-linked images (remote image patterns are disabled in `next.config.ts`);
* no analytics, advertising or tracking scripts;
* no credentials, API keys, Firebase configuration or demo user accounts from any source repository.
