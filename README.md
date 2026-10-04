# Beacon Hacks website

Next.js 16 (App Router) + React 19 + Tailwind v4. Cream paper, near-black
ink and one yellow, heavy grotesque type, ink-bordered cards with hard
offset shadows, and dark bands for the hero, the schedule and the close.
No component library, no 3D.

```
app/                 routes, fonts, metadata, generated OG card and icons
  apply/             the early application
  code-of-conduct/   the CoC page
  admin/             the dashboard: applications and the notify list
  outreachdashboard/ the sponsor outreach ledger, read from the team Gmail
  api/apply/         stores an application
  api/notify/        stores a notify signup
  api/admin/         sign in, list, CSV, delete
  api/outreach/sync/ pulls the mailbox into the ledger (dashboard button, daily cron)
components/          one file per section, plus ui/ primitives
  hero.tsx           name, actions, backers, the date card
  strip.tsx          the yellow band and the four-fact strip under the hero
  about.tsx, tracks.tsx, prizes.tsx, schedule.tsx, judges.tsx,
  sponsors.tsx, faq.tsx, site-header.tsx, site-footer.tsx
  notify/            the updates dialog, the inline form, their shared hook
  ui/lamp.tsx        the lamp: the full stop of a heading and its beam
lib/event.ts         every fact about the event that appears twice
lib/content.ts       all page copy and data: tracks, schedule, partners,
                     prizes, judges, packages, FAQ
lib/store.ts         where signups live (Upstash Redis, or a local file)
lib/admin-auth.ts    the shared admin password and its cookie
lib/outreach/        the outreach ledger: Gmail client, rules, model, roster, sync
assets/og/           font subsets for the generated share card (OFL)
public/sponsors/     partner logos, dark and light versions
public/photos/judges the headshots judges sent
public/brand/        the mark (mark.svg, mark-512.png) and the older brand kit
```

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

If `localhost` returns **HTTP 431**, another local app has left oversized cookies
on it. Use `http://127.0.0.1:3000` instead. `next.config.ts` already allows that
origin for dev assets. If 3000 is taken, `npx next dev -p 3200`.

```bash
npm run lint
npx tsc --noEmit       # typecheck
npm run build && npm start
NEXT_DIST_DIR=.next-check npm run build   # build beside a running dev server
```

## Design

The layout follows the language of student hackathon sites like Sentinel
Hacks: a dark hero with a tilted date card, a yellow word band, a dotted fact
strip, a full yellow section, a dark schedule, cards with ink borders and hard
shadows, pill buttons. The copy, the colours and the motif are Beacon's own.

- **Colour.** Every colour is a token at the top of `app/globals.css`.
  Yellow (`beacon`, #ffc72c) is a fill with ink text on it, or a colour on
  the dark bands. It is never text on cream (1.4:1); small accent text on
  cream uses ochre (`beacon-deep`, 6.4:1). All text tokens pass WCAG AA.
- **Type.** Bricolage Grotesque for headings, buttons and labels (with its
  optical size axis), Geist for running text and form fields, both through
  `next/font`. The references used "antiqua", which is TheAntiqua B by
  LucasFonts: a commercial face, and the only copies on this machine are
  trial files marked "for evaluation purposes only", so it is not used.
- **The lamp.** The full stop of "Beacon Hacks." and "See you in Belmont."
  is a yellow lamp with a beam running off to the right (`components/ui/lamp.tsx`).
  The mark (`components/ui/beacon-mark.tsx`) is the same lamp from above.
- **Utilities.** `brut` (bordered card, hard shadow), `brut-hover`, `dots`,
  `dots-dark`, `display-xl`, `meta` (small bold label, sets no colour),
  `outline-word` (the huge outlined word behind a section), `link`.

## Motion

Short and optional. The hero copy rises once and the beam lights up once on
load; cards and buttons lift on hover. Nothing starts hidden in the markup,
nothing scrolls on its own (the yellow band holds still: a moving ticker
would need a pause control under WCAG 2.2.2), and under
`prefers-reduced-motion` all of it is off.

## The honesty rule

**Nothing on this site may state something that has not actually been secured.**

`lib/event.ts` and `lib/content.ts` are the only places facts live, and each
unconfirmed thing says so in its own data and on the page.

| Fact | State | Unlock by |
|---|---|---|
| Date | Target, Saturday, January 30, 2027 | Confirmed with the venue. Set `EVENT.date.confirmed`, then add a schema.org `Event` block in `app/page.tsx`. |
| Venue | In approval; Belmont, CA only | Written approval from the host's facilities team. Fill in `EVENT.venue`, set `confirmed: true`. Their photos need separate permission. |
| Applications | Open early, nobody confirmed | Venue and budget set. |
| Budget | $0 of $10,500 in cash (`EVENT.budget`) | Money actually committed. In-kind support never moves `raisedUsd`. |
| Partners | CodeCrafters, Perfect Corp, YRI Fellowship, all in kind (`PARTNERS`) | A written yes. Cash sponsors go in `PARTNERS` with `form: "Cash"` and get their own logo row. |
| Prizes | Confirmed: CodeCrafters, YRI. For everyone: Perfect Corp. Pending: Render | Render moves to confirmed when the credit link and redemption rules arrive (`PENDING_OFFERS`). |
| Judges | Swosti Panda, Vasuki Uday Kiran Vudathala (`JUDGES`) | Agreement in writing plus a bio and headshot. |

No prize-pool total is ever shown: memberships, scholarships and credits are
not cash and do not add up.

## Sponsorship

Four packages in `PACKAGES` (`lib/content.ts`): Supporter $250, Community
$500, Partner $1,000, Presenting $2,500, each listing what is new at that
level. Nothing promises attendee contact data, recruiting access, merchandise,
judging seats or exclusivity. In kind is its own option and is not priced
against a package. Every "Inquire" button opens an email to
`EVENT.email.sponsors` with the package in the subject; there is no payment
flow. Outreach emails sent before October 2026 quoted the older
Bronze/Silver/Gold/Platinum prices; quote these instead from now on.

## Discord

`EVENT.social.discord` in `lib/event.ts` is empty, which hides every Discord
link. Paste the invite (`https://discord.gg/...`) and the logo appears in the
header, the phone menu, the FAQ, the footer and as a floating button.

## Brand

`public/brand/mark.svg` and `mark-512.png` are the current mark (yellow lamp
on the night); the favicon (`app/icon.svg`), the Apple icon and the share card
(`app/opengraph-image.tsx`) are generated from the same drawing. The older kit
in `public/brand/` (the amber GIFs and `banners/`, made by
`scripts/render-banners.py`) predates the redesign and still uses the amber
night look.

## Applications, the notify list, and the admin page

`/apply` takes an early application (six fields). "Get updates" (the dialog, or the form at the bottom of the home page) takes an
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

- The Discord invite (see above).
- Render's credit link, redemption rules and logo, then move the offer to confirmed.
- A separate sponsors address, if wanted. Everything routes to `team@beaconhacks.com`.
- Roster entries in `lib/outreach/roster.ts` for anyone new the mailbox writes to;
  without one the card is named after the domain and has no description.
