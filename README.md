# Beacon Hacks website

Next.js 16 (App Router) + React 19 + Tailwind v4. A lighthouse at night: the
hero and the closing are the night over the bay, with a lighthouse whose beam
sweeps the sky; the content sits on fog-white sections with hairline rules.
One accent, the lamp yellow. No component library, no 3D, no animation
library.

```
app/                 routes, the font, metadata, generated share card and icons
  code-of-conduct/   the code of conduct
  not-found.tsx      the 404: the night over the bay and the way home
  api/notify/        stores an updates signup
  llms.txt/          /llms.txt, the facts for AI assistants, built from lib/
components/          one file per section, plus ui/ primitives and ui/icons.tsx
  night-scene.tsx    the sky, the shore, the lighthouse and its beam
  countdown.tsx      the hero's countdown to doors open (client)
  hero.tsx, about.tsx, tracks.tsx, prizes.tsx, schedule.tsx, judges.tsx,
  sponsors.tsx, faq.tsx, site-header.tsx, site-footer.tsx (with the closing)
  apply/             the Apply button, a link to the registration page on Luma
  notify/            the updates form at the end of the home page, and its hook
lib/event.ts         every fact about the event that appears twice
lib/content.ts       all page copy and data: tracks, schedule, venue sponsor,
                     partners, prizes, judges, packages, FAQ
lib/store.ts         where updates signups live (Upstash Redis, or a local file)
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
- **The header** is a bar of night glass floating at the top of every page
  (`glass` in `app/globals.css`): the page passes beneath it blurred, under a
  sheen and a hairline of lamp light along its lower rim. Where a page opens
  on the night (the home page and the 404, `overlay`), the sky runs up under
  it and the glass starts out clearer; it smokes over once the page moves,
  so its links keep 7:1 over the fog. Discord and Apply sit at its right;
  on phones Discord moves into the menu, which drops down as the same glass.
- **The hero** ends in a strip: the four facts, and the countdown to doors
  open (`EVENT.date.starts`, labelled as the target date until
  `EVENT.date.confirmed`). The countdown is worked out in the browser, so the
  static page never holds a stale number; seconds stop under reduced motion.
- **The sponsor wall** (`components/sponsors.tsx`) shows the venue sponsor, then Hack Club as fiscal sponsor (`FISCAL_SPONSOR`, linking the public HCB ledger and donations),
  then one row per cash tier with its open places drawn dashed (`slots` in
  `PACKAGES`, each an email about that tier), then the in-kind partners. A
  partner with a `tier` fills the first open place in that row.
- **Prizes and perks** name only who gives: the sponsors' logos, for the
  winners and for every builder. What each one gives stays off the site and
  out of the code; participants get the details before the day.
- **Apply** buttons all open the registration page on Luma (`EVENT.applications.url`), in a new tab. `/apply` redirects there.
- **Donate** in the header, the hero and the footer goes to Beacon's HCB
  donation page (`EVENT.hcb.donate` in `lib/event.ts`).
- **The schedule, prizes and judges** rise into view as you scroll, driven
  by the scroll itself (`.reveal`, CSS `animation-timeline: view()`); without
  support, under reduced motion, or in print, they simply sit in place.
- **The role picker** in the updates form is `components/ui/select.tsx`, a
  listbox styled for the night, with full keyboard support.
- **Icons** come from `components/ui/icons.tsx`: one line family on a 24
  unit grid, coloured by `currentColor`, always beside text that says the
  same thing.
- **Utilities.** `wrap` (the content column), `night` (the dark ground; flips
  focus rings to the lamp), `glass` (night glass for what floats over the
  page; flips focus rings too), `heading` (section headings), `kicker` (a
  small label, used sparingly), `link` (a lamp underline).

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
| Partners | In kind: CodeCrafters, YRI Fellowship, Art of Problem Solving, Browserbase, Tavus, .xyz, Scrimba, Rosebud AI, SunFounder, Algoverse. Community: Non-Trivial. Supporter: Origami Prep (`PARTNERS`) | A written yes. |
| Prizes and perks | Prizes from CodeCrafters, YRI Fellowship, Origami Prep, AoPS, Scrimba and Algoverse; perks from Browserbase, Tavus, .xyz, Rosebud AI, SunFounder and Algoverse. Who gives, never what (`PRIZES_AND_PERKS`) | A written yes; `status: "pending"` shows "Being finalized". |
| Judges | Swosti Panda, Vasuki Uday Kiran Vudathala, Anna Zhang and Tiger Wang (Nessie, with their public YC bio and photo for now), Parth Maniar (role, employer, LinkedIn, photo and a short bio from his public profile), Dan Shalev (Garry's List; role, photo and bio from his public LinkedIn) (`JUDGES`) | Agreement in writing plus a bio and headshot; a judge without a photo shows initials. |
| Food | Breakfast, pizza for lunch, dinner, dessert from Simple Delights (schedule notes and the FAQ) | Already free for every student; vendors are in the local `.plans/food.md`. |

No prize-pool total is ever shown, and no sponsor's prize on its own either.

## Sponsorship

Four packages in `PACKAGES` (`lib/content.ts`): Supporter $250, Community
$500, Partner $1,000, Presenting $2,500, each listing what is new at that
level. Nothing promises attendee contact data, recruiting access, merchandise,
judging seats or exclusivity. In kind is its own option and is not priced
against a package. Every "Inquire" link opens an email to
`EVENT.email.sponsors` with the package in the subject; there is no payment
flow.

## Discord

`EVENT.social.discord` in `lib/event.ts` holds the invite
(`https://discord.gg/WUV8FtUkmB`, which does not expire). It puts Discord at
the right of the header, at the end of the phone menu, in the FAQ, in the
footer and as a floating button. An empty string hides every one of them.

## Brand

`public/brand/mark.svg` and `mark-512.png` are the mark (the lamp from above,
yellow on the night); the favicon (`app/icon.svg`) and the Apple icon are the
same drawing. The share card (`app/opengraph-image.tsx`) redraws the hero's
night scene with the title in Mona Sans.

## Registration and the updates list

Registration is on Luma (`EVENT.applications.url` in `lib/event.ts`): every
Apply button opens it, and `/apply` redirects there. The site no longer takes
applications itself; the form, its API and the `/admin` page came out on
Oct 25, 2026. Applications taken before then are still rows in the store.

The form at the end of the home page takes an email from anyone who is not
registering, rate limited per IP. **Storage** is `lib/store.ts`. With
`KV_REST_API_URL` and `KV_REST_API_TOKEN` set it uses Upstash Redis (add
"Upstash Redis" from the Vercel Marketplace and those are set for you); every
entry is a field of the `beacon:entries` hash, which the Upstash data browser
shows. That browser is the only view of the list now. Locally it writes
`.data/entries.json` (gitignored). On Vercel without a database it keeps
entries in `/tmp`, which does not survive a redeploy.

Optionally set `NOTIFY_WEBHOOK_URL` and every signup is also POSTed there as
JSON. `.env.example` lists both.

## Still to fill in

- A separate sponsors address, if wanted. Everything routes to `team@beaconhacks.com`.
