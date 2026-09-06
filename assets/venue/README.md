# Venue photos

Drop five photos of the venue in this folder, named exactly:

| File | Shown as |
|---|---|
| `main-floor.jpg` | Main floor |
| `atrium.jpg` | Atrium |
| `workshop-room.jpg` | Workshop room |
| `kitchen.jpg` | Kitchen |
| `lobby.jpg` | Lobby |

Then run `./optimize-venue-photos.sh` from the project root. It converts HEIC/PNG
to JPEG, caps the width at 1680px and compresses them.

Shot landscape. They render in a 3:2 box (`object-fit: cover`), so keep the
subject away from the edges.

Any file that is missing falls back to the dashed placeholder automatically —
the strip never shows a broken image — so you can add them one at a time.

**Use photos you have the right to publish.** This repo is public. Your own
photos are fine; photos taken from the web are not. If the venue supplies
images, check what they allow.
