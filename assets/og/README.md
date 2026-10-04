# Fonts for the generated share image

`app/opengraph-image.tsx` draws with these. `next/og` needs TTF, OTF or
WOFF files (not WOFF2), read from disk at build time.

| File | Source | Notes |
| --- | --- | --- |
| `Bricolage-Display-800.ttf` | Bricolage Grotesque (Google Fonts, `BricolageGrotesque[opsz,wdth,wght].ttf`) | Static instance at opsz 96, wdth 100, weight 800 |
| `Bricolage-Text-700.ttf` | same | Static instance at opsz 24, wdth 100, weight 700 |

Both are cut down to Basic Latin plus a few typographic marks. Bricolage
Grotesque is under the SIL Open Font License 1.1 (`OFL-Bricolage-Grotesque.txt`),
which allows subsetting and bundling it with the site; it declares no
Reserved Font Name. Regenerate with fontTools' `varLib.instancer` and
`subset` if the card needs characters outside the subset.
