#!/usr/bin/env bash
# Start the site on this machine (macOS / Linux / WSL). Extra args go to serve.py, e.g. ./start.sh --port 9000
cd "$(dirname "$0")" || exit 1
for py in python3 python; do
  if command -v "$py" >/dev/null 2>&1; then exec "$py" serve.py "$@"; fi
done
echo "Python 3 is required (https://www.python.org/downloads/)." >&2
exit 1
