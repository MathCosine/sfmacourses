# Brand assets

The SFMA logo is now a **built-in vector** (`components/Brand.tsx` →
`<LogoMark />`): a Σ monogram on the brand's blue gradient tile. It's used by
the header, footer, and hero, and mirrored as the browser favicon in
`app/icon.svg`. Nothing needs to be dropped here.

To change the logo, edit the SVG in `components/Brand.tsx` (and keep
`app/icon.svg` in sync for the favicon). If you'd rather use a raster image,
re-point `BrandMark` at a file under `/public`.
