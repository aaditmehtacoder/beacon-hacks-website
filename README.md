# Beacon Hacks — website

Static one-page site for Beacon Hacks, built from the **Beacon Hacks v2** Claude Design
artboard (`claude.ai/design` project `9c37c446…`). No build step, no dependencies.

```
index.html    markup + content
styles.css    design tokens and all layout
app.js        countdown, scroll motion, FAQ, apply wizard
serve.py      threaded local server (for previewing and for Tailscale)
```

## Run it

```bash
./serve.py
```

Then open http://127.0.0.1:8791. Opening `index.html` straight off disk works too.

`serve.py` is a threaded server bound to loopback. `python3 -m http.server` also
works, but it handles one request at a time, so a handful of simultaneous visitors
can stall each other.

## Deploy

Drop the static files on any host (Netlify, Vercel, GitHub Pages, S3). Nothing
server-side is required unless you wire up the application form below.

### Serving it from this Mac instead

`cloudflared tunnel --url http://127.0.0.1:8791` gives a temporary public HTTPS URL
backed by `serve.py`. The link lasts only while both stay running, and the hostname
changes on every restart.

Tailscale Funnel also works, but note two traps found the hard way:

- Funnel hostnames publish **AAAA records only**. Anyone on an IPv4-only network
  cannot reach them. You will not notice from a machine on the tailnet, because
  MagicDNS resolves the name to the node's own `100.x` address and never touches
  the public path.
- With an exit node active, `cloudflared` fails too: DNS goes to MagicDNS at
  `100.100.100.100`, which cannot resolve Cloudflare's edge SRV records, and the
  QUIC handshake to the edge times out. Turn the exit node off first.

## Wiring the application form

`app.js` starts with:

```js
var APPLY_ENDPOINT = null;
```

While it is `null` the three-step wizard validates and shows the confirmation screen
but **sends nothing**. Set it to a URL (Formspree, a Google Form proxy, a Cloudflare
Worker, your own API) and the wizard POSTs JSON:

```json
{ "name": "", "email": "", "school": "", "firstHackathon": true, "idea": "", "shirt": "M", "diet": "" }
```

A non-2xx response leaves the applicant on step 3 with an error and their answers intact.

## Before this goes live

- **Venue photos** — drop five files into `assets/venue/` and run
  `./optimize-venue-photos.sh`. See `assets/venue/README.md` for the names. Missing
  files fall back to the dashed placeholder, so they can be added one at a time.
- **Other placeholders** — dashed boxes marked `portrait` and `logo` (`.ph` in the
  CSS) still need real art. Swap each for an `<img>`; the boxes hold their aspect
  ratio already.
- **Dead links** — Code of conduct, Discord and Instagram in the footer are `href="#"`.
  The sponsor "View prospectus" link falls back to a mailto until it has a real PDF.
- **Names and numbers** — judges, organizers, prize amounts and the 42-schools figure
  came from the design comp and should be confirmed before publishing.
- **Date** — the countdown targets `2027-01-30T08:30:00-08:00`, set in `app.js`
  (`EVENT_START`) and repeated in the JSON-LD block in `index.html`.

## Notes on behavior

- Scroll motion (reveals, counters, the timetable rail, the venue filmstrip, hero
  parallax) is a direct port of the artboard's script. It reads and writes in separate
  passes inside one rAF loop to avoid layout thrash, and only elements near the
  viewport are tracked.
- `prefers-reduced-motion: reduce` disables all of it and renders the finished state.
- Without JavaScript the page is still complete and readable: content is in the HTML,
  the FAQ uses `<details>`, and reveal animations only ever hide things once JS runs.
