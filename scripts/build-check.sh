#!/usr/bin/env bash
# Builds the site and fails if `next build` fails or prints a warning.
# CI runs this on the real content; run it locally after touching build config.
set -o pipefail

pnpm build 2>&1 | tee build.log || exit 1
if grep -E "⚠|Warning:" build.log | grep -v "No build cache found"; then
  echo "::error::next build printed warnings (see above)"
  exit 1
fi
