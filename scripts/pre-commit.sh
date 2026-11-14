#!/bin/sh
# Runs `pnpm check` before each commit: one line when it passes, its full output when it fails.
if out=$(pnpm check 2>&1); then
  echo "pnpm check passed"
else
  echo "$out"
  exit 1
fi
