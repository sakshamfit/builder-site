# Brand assets

This folder is where the venue's approved logo files go. **It is intentionally empty, and the site
currently displays no logo at all.**

## Current state

The site identifies itself with **type only**: the venue's name set in Anton, positioned by the
layout. There is no logo, monogram, stamp, seal or drawn mark anywhere — not in the header, not in the
left rail, not in the footer, not on share cards.

That is a deliberate decision, not an omission. The venue has not supplied a logo, and drawing one
would mean inventing a brand identity the cinema has not approved. A neutral-looking mark invented by
a developer is still a claim about the brand.

The single exception is the browser favicon, `app/icon.svg`. A page without one shows a broken-tab
glyph, so it is kept as a plain, neutral mark that carries no identity — it is a browser affordance,
not branding. Replace it in the same step as the logo.

## When the approved logo arrives

1. Add the files here — SVG preferred, with a light-surface and a dark-surface variant, plus a
   monochrome mark.
2. Wire it into `components/layout/SiteHeader.tsx` (the wordmark block) and the rail
   (`components/layout/Rail.tsx`, currently intentionally mark-free).
3. Replace `app/icon.svg` with the mark, and add the social preview image referenced in
   `lib/metadata.ts`.
4. Set `NEXT_PUBLIC_BRAND_DISPLAY_NAME` to the confirmed trade name, and
   `NEXT_PUBLIC_BRAND_ATTRIBUTION` only if an operator or mall attribution line has been approved in
   writing.
5. Record the source, owner and licence in `ASSET_CREDITS.md` §2.

## Do not

- Do not use mall logos, operator marks or third-party brand assets without written permission. This
  site does not imply an official relationship with the mall or with any cinema operator.
- Do not recreate a logo from memory, from a photograph, or by tracing one. An approximate logo is
  worse than no logo.
