#!/bin/sh
# Runs `pnpm check` before each commit. When it passes, prints one line plus any warnings;
# when it fails or is interrupted, prints its full output.
log=$(mktemp)
trap 'cat "$log"; rm -f "$log"; exit 130' INT TERM
echo "pnpm check…"
if pnpm check >"$log" 2>&1; then
  grep -i "warn" "$log"
  echo "pnpm check passed"
  rm -f "$log"
else
  cat "$log"
  rm -f "$log"
  exit 1
fi
