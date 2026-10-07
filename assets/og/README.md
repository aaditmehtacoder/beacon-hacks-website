# Fonts for the generated share image

`app/opengraph-image.tsx` draws with these. `next/og` needs TTF, OTF or
WOFF files (not WOFF2), read from disk at build time.

| File | Instance |
| --- | --- |
| `MonaSans-Expanded-ExtraBold.ttf` | Mona Sans, width 125, weight 800: the title |
| `MonaSans-SemiExpanded-Bold.ttf` | Mona Sans, width 112.5, weight 700: labels |
| `MonaSans-Medium.ttf` | Mona Sans, width 100, weight 500: running text |

All three are the static instances Google Fonts serves for those axis
values (`fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@125,800`
and so on), unmodified. Mona Sans is by GitHub under the SIL Open Font
License 1.1 (`OFL-Mona-Sans.txt`), which allows bundling it with the site.
