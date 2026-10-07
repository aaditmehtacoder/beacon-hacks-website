# Beacon Hacks website

Next.js 16 (App Router) + React 19 + Tailwind v4. A lighthouse at night: the
hero and the closing are the night over the bay, with a lighthouse whose beam
sweeps the sky; the content sits on fog-white sections with hairline rules.
One accent, the lamp yellow. No component library, no 3D, no animation
library.

```
app/                 routes, the font, metadata, generated share card and icons
  apply/             the early application
  code-of-conduct/   the code of conduct
  api/apply/         stores an application
  api/notify/        stores an updates signup
  llms.txt/          /llms.txt, the facts for AI assistants, built from lib/
components/          one file per section, plus ui/ primitives and ui/icons.tsx
  night-scene.tsx    the sky, the shore, the lighthouse and its beam
  countdown.tsx      the hero's countdown to doors open (client)
  hero.tsx, about.tsx, tracks.tsx, prizes.tsx, schedule.tsx, judges.tsx,
  sponsors.tsx, faq.tsx, site-header.tsx, site-footer.tsx (with the closing)
  apply/             the Apply button and the pop-up it opens
  notify/            the updates form at the end of the home page, and its hook
lib/event.ts         every fact about the event that appears twice
lib/content.ts       all page copy and data: tracks, schedule, venue sponsor,
                     partners, prizes, judges, packages, FAQ
lib/store.ts         where signups live (Upstash Redis, or a local file)
assets/og/           Mona Sans instances for the generated share card (OFL)
public/sponsors/     sponsor and partner logos
public/photos/judges the headshots judges sent
public/brand/        the mark (mark.svg, mark-512.png)
```

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npx next dev -p 3001   # or any other port
```

If `localhost` returns **HTTP 431**, another local app has left oversized cookies
on it. Use `http://127.0.0.1:<port>` instead. `next.config.ts` already allows that
origin for dev assets.

```bash
npm run lint
npx tsc --noEmit       # typecheck
npm run build && npm start
NEXT_DIST_DIR=.next-check npm run build   # build beside a running dev server
```

## Design

- **Scene.** `components/night-scene.tsx` draws the sky (stars from a seeded
  scatter, so every render matches), the hills across the bay, the water, the
  headland, the keeper's house and the lighthouse, in a 1600 x 500 box pinned
  to the bottom right and scaled to cover it: on a phone the lighthouse stays
  in view and the hills run off to the left. The light is HTML positioned with
  container query units on the same scale, so it animates on the compositor.
- **Motion.** The beam sweeps between inland (over the title) and out to sea
  every 16 seconds and flashes as it turns toward you (`sweep` and `flash` in
  `app/globals.css`). Only transform and opacity animate. The hero copy rises
  once on load. Under `prefers-reduced-motion` nothing moves and the beam
  holds still, pointing inland.
- **Colour.** Every colour is an OKLCH token at the top of `app/globals.css`:
  `night` and `moon` for the dark grounds and their text, `fog` and `ink` for
  the day, `lamp` for the light. Yellow is a fill with ink text on it, or
  light on the night; it is never text on fog. Small accent text on fog uses
  `lamp-deep` (5.3:1). All text tokens pass WCAG AA; the ratios are in the
  comment at the top of the file.
- **Type.** Mona Sans, one variable family through `next/font`, with its
  width axis doing the hierarchy: headings expanded (125%) and heavy, labels
  semi-expanded, running text at normal width.
- **The schedule** is the day passing: a pale morning panel, a warm afternoon
  and a night evening.
- **The hero** ends in a strip: "Sponsored by" with the white logos
  (`logoOnNight`) of confirmed sponsors only, and the countdown to doors open
  (`EVENT.date.starts`, labelled as the target date until
  `EVENT.date.confirmed`). The countdown is worked out in the browser, so the
  static page never holds a stale number; seconds stop under reduced motion.
- **The sponsor wall** (`components/sponsors.tsx`) shows the venue sponsor,
  then one row per cash tier with its open places drawn dashed (`slots` in
  `PACKAGES`, each an email about that tier), then the in-kind partners. A
  partner with a `tier` fills the first open place in that row.
- **Prizes and perks** name who gives what in a few words; the amounts and
  terms are the sponsors' to announce.
- **Apply** buttons are links to `/apply` that open the application as a
  pop-up (`components/apply/`, a native `<dialog>`); the form loads on first
  hover or focus. The pop-up skips the optional question; `/apply` keeps it.
- **The schedule, prizes and judges** rise into view as you scroll, driven
  by the scroll itself (`.reveal`, CSS `animation-timeline: view()`); without
  support, under reduced motion, or in print, they simply sit in place.
- **The role picker** in the updates form is `components/ui/select.tsx`, a
  listbox styled for the night, with full keyboard support.
- **Icons** come from `components/ui/icons.tsx`: one line family on a 24
  unit grid, coloured by `currentColor`, always beside text that says the
  same thing.
- **Utilities.** `wrap` (the content column), `night` (the dark ground; flips
  focus rings to the lamp), `heading` (section headings), `kicker` (a small
  label, used sparingly), `link` (a lamp underline).

## Search and AI assistants

`/llms.txt` sums the event up in Markdown for AI assistants, generated at
build time from `lib/event.ts` and `lib/content.ts`. The home page carries
Organization, WebSite and FAQPage structured data (no Event until the date
is confirmed: schema.org has no "tentative"), the layout sets city-level geo
tags for Belmont (never the venue), and `robots.txt` names the AI crawlers it
welcomes.

## The honesty rule

**Nothing on this site may state something that has not actually been secured.**

`lib/event.ts` and `lib/content.ts` are the only places facts live, and each
unconfirmed thing says so in its own data and on the page.

| Fact | State | Unlock by |
|---|---|---|
| Date | Target, Saturday, January 30, 2027 | Set `EVENT.date.confirmed`; every "target date" note keys off it. Then add a schema.org `Event` block in `app/page.tsx`. |
| Venue | Being finalized. RingCentral's logo shows as the venue sponsor with a "Being finalized" tag (`VENUE_SPONSOR.status: "pending"`); the venue is not named or addressed anywhere else. | Written approval: fill in `EVENT.venue` (name, place, address, map) and set `confirmed: true`, then set `VENUE_SPONSOR.status` to `"confirmed"` with its `line` and `address`. |
| Applications | Open early, nobody confirmed | The venue and budget are set. |
| Partners | In kind: CodeCrafters, YRI Fellowship, Browserbase. Supporter: Origami Prep (`PARTNERS`) | A written yes, and a light logo for the hero (`logoOnNight`). |
| Prizes and perks | CodeCrafters and YRI (prizes), Browserbase (a promo code). Being finalized: Render (`PRIZES_AND_PERKS`) | Render moves to `status: "confirmed"` when the credit link and redemption rules arrive. |
| Judges | Swosti Panda, Vasuki Uday Kiran Vudathala (`JUDGES`) | Agreement in writing plus a bio and headshot. |

No prize-pool total is ever shown: memberships, scholarships and credits are
not cash and do not add up.

## Sponsorship

Four packages in `PACKAGES` (`lib/content.ts`): Supporter $250, Community
$500, Partner $1,000, Presenting $2,500, each listing what is new at that
level. Nothing promises attendee contact data, recruiting access, merchandise,
judging seats or exclusivity. In kind is its own option and is not priced
against a package. Every "Inquire" link opens an email to
`EVENT.email.sponsors` with the package in the subject; there is no payment
flow.

## Discord

`EVENT.social.discord` in `lib/event.ts` is empty, which hides every Discord
link. Paste the invite (`https://discord.gg/...`) and the logo appears in the
header, the phone menu, the FAQ, the footer and as a floating button.

## Brand

`public/brand/mark.svg` and `mark-512.png` are the mark (the lamp from above,
yellow on the night); the favicon (`app/icon.svg`) and the Apple icon are the
same drawing. The share card (`app/opengraph-image.tsx`) redraws the hero's
night scene with the title in Mona Sans.

## Applications and the updates list

`/apply` takes an early application (six fields). The form at the end of the
home page takes an email from anyone who is not applying. Both land in the
same store, one row per email, newest wins, and both are rate limited per IP.

**Storage** is `lib/store.ts`. With `KV_REST_API_URL` and `KV_REST_API_TOKEN`
set it uses Upstash Redis (add "Upstash Redis" from the Vercel Marketplace and
those are set for you); every entry is a field of the `beacon:entries` hash,
which the Upstash data browser shows. Locally it writes `.data/entries.json`
(gitignored).

Optionally set `NOTIFY_WEBHOOK_URL` and every signup is also POSTed there as
JSON. `.env.example` lists both.

## Still to fill in

- The Discord invite (see above).
- Render's credit link, redemption rules and logo, then move the offer to confirmed.
- A separate sponsors address, if wanted. Everything routes to `team@beaconhacks.com`.
