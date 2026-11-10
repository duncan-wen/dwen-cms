#!/usr/bin/env bash
# After a merge: wait for main's production deployment, then check it.
#   pnpm prod:check                  check the home page
#   pnpm prod:check /posts/<slug>    check that path too
# Prints the live deployment's id, any error the last 55 minutes of production logs
# record against it (the Hobby plan keeps under an hour), and each path's status.
# Fails if the deployment fails, an error is logged against it, or a path doesn't answer 200.
set -uo pipefail

site="https://duncan-wen.aibbm.org"
scope="team_dUM4e6kZ7gTvxEVRfG8zGjpi"
paths=("/" "$@")

state=""
for _ in $(seq 1 60); do
  state=$(gh api repos/duncan-wen/dwen-cms/commits/main/status --jq .state)
  [ "$state" = "pending" ] || break
  sleep 15
done
echo "deployment: $state"
[ "$state" = "success" ] || exit 1

# The Vercel CLI runs outside the repo, so it never links it (linking writes .vercel/).
work=$(mktemp -d)
cd "$work" || exit 1

# `vercel inspect` keeps running after it prints; the id is all it's needed for.
id=$(timeout 60 vercel inspect "${site#https://}" --scope "$scope" 2>&1 | grep -m1 -oE 'dpl_[A-Za-z0-9]+')
if [ -z "$id" ]; then
  echo "couldn't read the live deployment's id: is the Vercel CLI logged in? (vercel whoami)"
  exit 1
fi
echo "live: $id"

# A query that fails prints no summary line, so it never passes for one that found nothing.
if ! logs=$(vercel --scope "$scope" logs --project dwen-cms -e production --query 'level:error' --since 55m --json 2>&1) ||
  ! grep -q '"type":"summary"' <<<"$logs"; then
  echo "couldn't read the production logs:"
  echo "$logs"
  exit 1
fi
errors=$(grep '^{' <<<"$logs" | jq -c --arg id "$id" 'select(.type != "summary" and .data.deploymentId == $id)')
failed=0
if [ -n "$errors" ]; then
  echo "errors logged by $id:"
  echo "$errors"
  failed=1
else
  echo "errors: none"
fi

for path in "${paths[@]}"; do
  status=$(curl -sL --max-time 30 -o /dev/null -w "%{http_code}" "$site$path")
  echo "$status $site$path"
  [ "$status" = "200" ] || failed=1
done
rm -rf "$work"
exit $failed
