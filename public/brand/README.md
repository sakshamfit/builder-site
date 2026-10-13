# Brand assets

This folder is where the venue's approved brand assets go.

It is intentionally empty. The header currently draws a neutral "screen light" wordmark in
`components/layout/SiteHeader.tsx`, and the favicon is `app/icon.svg` — both original drawings made
for this project that do not resemble any cinema chain's mark.

**Do not add a logo here until the operator confirms it is authorised for use on this site.** Once it
is:

1. Add the approved files here (SVG preferred; supply a dark-surface variant and a monochrome mark).
2. Replace the `BrandMark` component in `components/layout/SiteHeader.tsx` and update `app/icon.svg`.
3. Set `NEXT_PUBLIC_BRAND_DISPLAY_NAME` to the confirmed trade name, and
   `NEXT_PUBLIC_BRAND_ATTRIBUTION` if an operator or mall attribution line is approved.
4. Record the source, owner and licence in `ASSET_CREDITS.md`.

Do not use mall logos, operator marks or third-party brand assets without written permission — this
site does not imply an official relationship with the mall or any cinema operator.
