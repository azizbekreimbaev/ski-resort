#!/usr/bin/env bash

set -euo pipefail

readonly EXPECTED_BRANCH="master"

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$EXPECTED_BRANCH" ]]; then
  echo "Deployment must run from the ${EXPECTED_BRANCH} branch (current: ${current_branch})." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Deployment stopped because the server working tree has local changes." >&2
  git status --short >&2
  exit 1
fi

git pull --ff-only origin "$EXPECTED_BRANCH"

echo "Deploying commit $(git rev-parse --short HEAD)"
docker compose config --quiet
docker compose up -d --force-recreate --remove-orphans

echo "Container status:"
docker compose ps
