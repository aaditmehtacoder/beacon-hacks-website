# Beacon Hacks website

Next.js 16 (App Router) + React 19 + Tailwind v4, with a three.js lighthouse
lens in the hero. Dark only, one accent colour, no component library.

```
app/                 routes, fonts, metadata, generated OG card
  api/notify/        the notify-list endpoint (validated, rate limited)
  code-of-conduct/   the CoC page
components/          one file per section, plus ui/ primitives
  beacon/            the three.js lens: scene, frame, CSS fallback
  ui/reveal.tsx      the one scroll entrance (rise, or tilt for cards)
  ui/text-reveal.tsx masked display type rising from its baseline
  ui/magnetic.tsx    buttons that lean toward the cursor
lib/event.ts         every fact about the event that appears twice
lib/content.ts       all page copy and data
lib/status.ts        the three gates shown on the status board
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
  Under reduced motion it is one unpinned screen with the facts shown.
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
| Application form, countdown, deadlines | Gate 3 | Gates 1 and 2 done. Set `EVENT.applications.open`. |
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
- A separate sponsors address. Everything routes to `team.beaconhacks@gmail.com` until one exists.
- The domain in `EVENT.url`, which metadata and the OG card resolve against.
