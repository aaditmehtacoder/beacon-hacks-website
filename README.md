# Beacon Hacks — website

Next.js 16 (App Router) + React 19 + Tailwind v4. Light mode, one accent colour,
no component library.

```
app/                 routes, fonts, metadata, generated OG card
  api/notify/        the notify-list endpoint (validated, rate limited)
  code-of-conduct/   the CoC page
components/          one file per section, plus ui/ primitives
lib/event.ts         every fact about the event that appears twice
lib/content.ts       all page copy and data
lib/status.ts        the three gates shown on the status board
public/photos/       stock photography (see "Photos" below)
```

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

If `localhost` returns **HTTP 431**, another local app has left oversized cookies
on it. Use `http://127.0.0.1:3000` instead — `next.config.ts` already allows that
origin for dev assets.

```bash
npm run build && npm start
npx tsc --noEmit       # typecheck
```

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
| Application form, countdown, deadlines | Gate 3 | Gates 1 and 2 done. Set `EVENT.applications.open`. |
| Judges | — | Someone agreeing in writing. There is no judges list until then. |
| Sponsor logos | — | A signed sponsor. The tiers are empty dashed slots, labelled as open. |

Also deliberately absent until Gate 1: the **schema.org `Event` block**. Publishing
structured event data for an unconfirmed date and venue would push it into search
results and calendar surfaces. Restore it in `app/page.tsx` once the date is locked.

## Photos

`public/photos/` is stock photography from Unsplash (free to use commercially, no
attribution required). **None of it is the Beacon venue.** The site says so in
three places — the hero image badge, the strip heading in the venue section, and
the footer — and those labels must stay until they are replaced with real photos
we took ourselves.

## Notify list

`app/api/notify/route.ts` validates with Zod, rate limits per IP, and forwards to
`NOTIFY_WEBHOOK_URL` if set:

```bash
NOTIFY_WEBHOOK_URL=https://formspree.io/f/xxxx npm run dev
```

Unset, it validates and logs server-side and the form still works end to end.
Payload: `{ email, school, role: "student" | "mentor" | "sponsor" | "other" }`.

## Still to fill in

- Karsten's full name and both organizer roles in `ORGANIZERS` (`lib/content.ts`).
- Whether `team@beaconhacks.org` / `sponsors@beaconhacks.org` actually receive mail.
- The domain in `EVENT.url`, which metadata and the OG card resolve against.
