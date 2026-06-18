# Brand assets

Drop the SFMA logo here as:

    public/brand/sfma-logo.png

It is used automatically by the site **header**, **footer**, and **hero**
(`components/Brand.tsx` → `<BrandMark />`). Until the file exists, those spots
fall back to an inline silver-on-charcoal SVG recreation of the emblem, so
nothing ever shows a broken image.

Tips:
- A square, transparent-background PNG looks best (the mark is rendered in a
  rounded square ~36–64px on screen).
- To use a different filename or format (e.g. `.svg`/`.webp`), update the
  `src` in `components/Brand.tsx`.

## Favicon

The browser-tab icon lives at `app/icon.svg` and already renders a metallic
"SFMA / courses" emblem. To make the favicon the *exact* uploaded raster
instead, add `app/icon.png` (Next.js prefers it) — or replace `app/icon.svg`.
