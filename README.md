# Beacon Hacks website

Next.js 16 (App Router) + React 19 + Tailwind v4, with a three.js lighthouse
lens in the hero. Dark only, one accent colour, no component library.

```
app/                 routes, fonts, metadata, generated OG card and icons
  apply/             the early application
  admin/             the dashboard: applications and the notify list
  outreachdashboard/ the sponsor outreach ledger, read from the team Gmail
  api/apply/         stores an application
  api/notify/        stores a notify signup
  api/admin/         sign in, list, CSV, delete
  api/outreach/sync/ pulls the mailbox into the ledger (dashboard button, daily cron)
  code-of-conduct/   the CoC page
components/          one file per section, plus ui/ primitives
  beacon/            the three.js lens: scene, frame, CSS fallback
  ui/reveal.tsx      the one scroll entrance (rise, or tilt for cards)
  ui/text-reveal.tsx masked display type rising from its baseline
  ui/magnetic.tsx    buttons that lean toward the cursor
lib/event.ts         every fact about the event that appears twice
lib/content.ts       all page copy and data
lib/status.ts        the three gates shown on the status board
lib/store.ts         where signups live (Upstash Redis, or a local file)
lib/admin-auth.ts    the shared admin password and its cookie
lib/outreach/        the outreach ledger: Gmail client, rules, model, roster, sync
scripts/gmail-auth.mjs  one-time Gmail authorisation for the ledger
app/robots.ts        robots.txt
app/sitemap.ts       sitemap.xml, the two public routes
public/photos/       stock photography (see "Photos" below)
```

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

If `localhost` returns **HTTP 431**, another local app has left oversized cookies
on it. Use `http://127.0.0.1:3000` instead. `next.config.ts` already allows that
origin for dev assets.

```bash
npm run build && npm start
npx tsc --noEmit       # typecheck
```

`three` is pinned to 0.185: `postprocessing` 6.39 caps it below 0.186. Bump
them together.

## The beacon

`components/beacon/` is a Fresnel lighthouse lens built from the parts a real
one has: a lamp, two bullseye panels that focus it into beams, dioptric rings,
glass barrel arcs and brass astragals. The cage turns; the lamp does not. Dust
in the air lights up only inside a beam, which is what makes the beam read as
light. It ignites with a real lamp flicker, and the first sweep hits the camera
just after the headline has settled.

`beacon.tsx` is the frame and makes every call the page cares about:

- The CSS lamp in `beacon-fallback.tsx` is always rendered, so the panel is
  never empty: before hydration, while three.js downloads, or without WebGL2.
- The scene mounts a beat after hydration, stops rendering when scrolled off
  screen or the tab is hidden, and renders one still frame for
  `prefers-reduced-motion`.
- Phones and small laptops get fewer motes and a lower pixel ratio.
- The hero is a full-viewport stage that pins for one screen of scrolling:
  the lens turns with the scroll, the camera rises and pushes in, the facts
  rise into place (`--stage-progress`, plain CSS), then the page lets go.
  The countdown holds the bottom left. Under reduced motion it is one
  unpinned screen with the facts shown.
- It writes `--beam-facing` (0..1, how squarely a beam points at the visitor)
  onto `<html>` every frame; the hero background uses it to breathe with the
  light.
- It never shows a black box. A running loop is not proof of a visible lamp,
  so once lit it reads the centre pixel a few times and hands over to the CSS
  lamp if that stays dark. A lost WebGL context, a thrown error, or a machine
  without half-float framebuffers ends up on the CSS lamp too.

The stage sits on `band`, a step below the page, and pulls up under the
sticky header so the night is behind the header at the very top.

Inside `beacon-scene.tsx`, everything the frame loop touches is declared in
JSX and reached through a ref. The React Compiler lint forbids mutating
anything created during render, and that is the idiomatic way around it.

## Motion

Three pieces, all of which are no-ops under `prefers-reduced-motion`:

- `<Reveal>` fires once on the way in. `variant="rise"` fades up;
  `variant="tilt"` also settles flat from a slight lean, and is what card
  grids get.
- `<TextReveal>` lifts display type out from behind its own baseline. On mount
  in the hero, `inView` everywhere else. It observes the outer, unclipped span:
  the inner one starts translated outside the clip region, and an observer on
  it would never report it visible.
- `<Magnetic>` lets the primary buttons lean a few pixels toward the mouse.

## The palette

Dark only. Every colour, rule, shadow and glow is a variable at the top of
`app/globals.css`, and components name tokens rather than colours. Two of the
names need a word:

- `band` / `band-ink` are the deep band a step below the page: the hero
  stage, the marquee and the closing card, and the ink that goes with them.
- Shadows and glows are variables (`--sh-*`, `--glow-*`) applied through the
  `@utility` rules at the bottom of the file, because Tailwind inlines colours
  in its own shadow scale and the palette should live in one place.

## The honesty rule

**Nothing on this site may state something that has not actually been secured.**

`lib/event.ts`, `lib/content.ts` and `lib/status.ts` are the only places facts
live, and each unconfirmed thing is rendered through `<Locked>` / `<LockChip>`
(`components/ui/locked.tsx`) instead of being asserted. The status board
(`components/status-board.tsx`) is the single source of truth for what is real.

Currently locked, and what unlocks it:

| Locked | Gate | Unlock by |
|---|---|---|
| Venue name, address, photos of the building | Gate 1 | Written approval from the host's facilities team. Then fill in `EVENT.venue` and set `confirmed: true`. |
| Prize cash, hardware, perks | Gate 2 | Money actually committed. Update `EVENT.budget.raisedUsd`; add amounts to `PLANNED_PRIZE_CATEGORIES` only once funded. |
| Confirmed spots, countdown, deadlines | Gate 3 | Gates 1 and 2 done. Early applications are open now; confirmations wait for both. |
| Judges | n/a | Someone agreeing in writing. There is no judges list until then. |
| Sponsor logos | n/a | A signed sponsor. The tiers are empty dashed slots, labelled as open. |

Also deliberately absent until Gate 1: the **schema.org `Event` block**. Publishing
structured event data for an unconfirmed date and venue would push it into search
results and calendar surfaces. Restore it in `app/page.tsx` once the date is locked.

## Photos

`public/photos/` is stock photography from Unsplash (free to use commercially, no
attribution required), used only for the three cards in the Day section.
**None of it is the Beacon venue.** The footer says so, and that line must
stay until the photos are replaced with real ones we took ourselves.

The same rule covers the host's own photography. Until they have signed off in
writing *and* given permission to use their images, their building does not
appear here, whether or not the picture is public on their site.

## Brand

`public/brand/` holds the mark (animated GIF at 512 and 128, PNG, SVG) and
`banners/`: Discord server banner and invite splash (the splash also fits an
MLH event page), LinkedIn profile banner, company cover and post image, and
an X header. They are the hero's night with the tagline, drawn in the site's
own type, and text stays clear of where LinkedIn and X overlay the avatar.
Regenerate with `python3 scripts/render-banners.py` (Pillow and numpy; the
fonts are fetched on first run).

## Applications, the notify list, and the admin page

`/apply` takes an early application (six fields). "Get notified" takes an
email from anyone who is not applying. Both land in the same store, one row
per email, newest wins, and both are rate limited per IP.

**Storage** is `lib/store.ts`. With `KV_REST_API_URL` and `KV_REST_API_TOKEN`
set it uses Upstash Redis; add "Upstash Redis" from the Vercel Marketplace and
those are set for you. Locally it writes `.data/entries.json` (gitignored). On
Vercel without a database it keeps entries in `/tmp` and the admin page says
loudly that nothing is being saved.

`/api/health` reports which storage backend is live (and nothing else), so
that can be checked without signing in.

**`/admin`** shows everyone, newest first: filter, search, copy the emails,
download a CSV, remove a row. It is behind one shared password,
`ADMIN_PASSWORD`, which must be set in production (the development default is
`cwb`, so it works out of the box without a password in git). The page is
`noindex` and excluded from `robots.txt` and the sitemap.

Optionally set `NOTIFY_WEBHOOK_URL` and every signup is also POSTed there as
JSON. `.env.example` lists all of it.

## The outreach ledger

**`/outreachdashboard`** is the sponsor outreach record, modelled on the YC
outreach ledger: every organisation `team.beaconhacks@gmail.com` has written
to, with who answered, what they offered, what bounced, and what to do next.
It sits behind the same `ADMIN_PASSWORD` as `/admin`, is `noindex`, and is
excluded from `robots.txt`.

The page is an **escalation ladder** (`lib/outreach/stages.ts`): every
organisation sits on exactly one rung, most urgent rung first, and inside a
rung the longest wait comes first.

| Rung | Court | Meaning |
| --- | --- | --- |
| Your move | yours | A person wrote last; the reply is owed by the team. |
| Follow-up due | yours | Quiet for 7 days or more since the team last wrote. |
| Needs a new route | yours | Every address bounced. |
| Their move | theirs | A person engaged and the team answered last. |
| In their queue | theirs | An automated receipt came back; a person still has to read it. |
| Sent, no answer yet | theirs | Under 7 days old, nothing back. |
| Working together | settled | `converted: true` in the roster. |
| Closed | settled | A person said no and offered nothing else. |

Rungs are worked out when the page renders, so a thread climbs to "Follow-up
due" on its own as the days pass. The outcome (active, rejected, waiting)
still drives the tick strip and the five numbers.

It reads Gmail, it never writes to it. `lib/outreach/`:

| File | What it does |
| --- | --- |
| `gmail.ts` | Refresh token to access token, list threads, flatten a thread. `gmail.readonly` only. |
| `classify.ts` | The rules: which addresses bounced, which sent an automated receipt, which were answered by a person. The model call for answered threads. |
| `roster.ts` | Who each organisation is, keyed by the domain we wrote to, plus human overrides. |
| `sync.ts` | Gmail to ledger: group threads by organisation, apply the rules, ask the model only about threads a person answered and only when something changed, reapply overrides, store. |
| `store.ts` | The ledger as one JSON document in Upstash (the signups database), or `.data/outreach.json` locally. |

Only threads the mailbox **started** count as outreach, so a reply sent in
someone else's thread never becomes a card. A thread with no human answer is
described by the rules for free; a thread a person answered goes to the model
(`OPENAI_API_KEY`, `gpt-4.1-mini` by default), which decides `active`,
`rejected` or `waiting`, names who replied, and writes the summary and the
next step. An unchanged thread is never sent again, so a sync of a mailbox
nobody has answered since last time costs nothing.

**Connecting Gmail.** A Google Cloud OAuth client with the `gmail.readonly`
scope and `http://localhost:3000/api/auth/gmail/callback` as a redirect URI.
Put its id and secret in `.env.local`, run `node scripts/gmail-auth.mjs`, and
authorise as the team mailbox. The script checks *which* account authorised
and revokes anything that is not `OUTREACH_MAILBOX`, then stores
`GOOGLE_REFRESH_TOKEN`. If the browser cannot reach `localhost` (the 431
problem above), paste the URL it landed on:
`node scripts/gmail-auth.mjs "<that URL>"`. Copy the three `GOOGLE_*`
variables to Vercel.

**Syncing.** The "Sync now" button on the page, or `POST /api/outreach/sync`
with the admin cookie. `vercel.json` also runs it once a day at 07:00 Pacific;
Vercel signs that call with `CRON_SECRET`, which must be set. A sync reads
every thread (a few seconds for a few dozen) and asks the model about the
changed ones, so the route allows 60 seconds.

**Overrides.** A reply that arrives by phone, form or LinkedIn is invisible
to Gmail, and the sync would keep calling that thread "waiting". Add an
`override` to the organisation's roster entry with a `reason`; it is reapplied
after every sync. `converted: true` is the only way into "Working together",
and means a signed agreement, not a promising thread. The honesty rule holds:
nothing on this ledger reaches the public site.

## Still to fill in

- A separate sponsors address, if wanted. Everything routes to `team@beaconhacks.com`.
- Roster entries in `lib/outreach/roster.ts` for anyone new the mailbox writes to;
  without one the card is named after the domain and has no description.
