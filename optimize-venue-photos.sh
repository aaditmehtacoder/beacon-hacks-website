#!/bin/bash
# Resize and compress whatever is dropped into assets/venue/ for the web.
# Uses sips, which ships with macOS — nothing to install.
#
#   ./optimize-venue-photos.sh
#
# Expects these five names (HEIC, PNG and JPEG all fine as input):
#   main-floor  atrium  workshop-room  kitchen  lobby
set -euo pipefail
cd "$(dirname "$0")/assets/venue"

shopt -s nullglob nocaseglob
for f in *.heic *.HEIC *.png *.jpeg; do
  base="${f%.*}"
  echo "converting $f -> $base.jpg"
  sips -s format jpeg -s formatOptions 82 "$f" --out "$base.jpg" >/dev/null
  rm "$f"
done

for f in *.jpg; do
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  if [ "$w" -gt 1680 ]; then
    echo "resizing $f (${w}px -> 1680px)"
    sips --resampleWidth 1680 "$f" >/dev/null
  fi
  sips -s format jpeg -s formatOptions 82 "$f" --out "$f" >/dev/null
  printf "  %-22s %sx%s  %s\n" "$f" \
    "$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')" \
    "$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')" \
    "$(du -h "$f" | cut -f1)"
done
echo "done"
