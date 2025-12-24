#!/usr/bin/env bash

# Start the Managed ChatKit FastAPI backend.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

if [ ! -d ".venv" ]; then
  echo "Creating virtual env in $PROJECT_ROOT/.venv ..."
  python -m venv .venv
fi

# Activate venv (supports Unix and Windows Git Bash)
if [ -f ".venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
  # shellcheck disable=SC1091
  source .venv/Scripts/activate
else
  echo "Virtualenv not found. Create it with 'python -m venv .venv' (or 'py -3 -m venv .venv' on Windows) inside backend/ then rerun."
  exit 1
fi

echo "Installing backend deps (editable) ..."
pip install -e . >/dev/null

# Load env vars from the repo's .env.local (if present) so OPENAI_API_KEY
# does not need to be exported manually.
ENV_FILE="$PROJECT_ROOT/../.env.local"
if [ -z "${OPENAI_API_KEY:-}" ] && [ -f "$ENV_FILE" ]; then
  echo "Sourcing OPENAI_API_KEY from $ENV_FILE"
  # shellcheck disable=SC1090
  set -a
  . "$ENV_FILE"
  set +a
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "Set OPENAI_API_KEY in your environment or in .env.local before running this script."
  exit 1
fi

UNAME_OUT="$(uname -s 2>/dev/null || echo '')"
APP_DIR="$PROJECT_ROOT"
if echo "$UNAME_OUT" | grep -qiE "mingw|msys|cygwin"; then
  PROJECT_ROOT_PY="$PROJECT_ROOT"
  if command -v cygpath >/dev/null 2>&1; then
    PROJECT_ROOT_PY="$(cygpath -w "$PROJECT_ROOT")"
  elif pwd -W >/dev/null 2>&1; then
    PROJECT_ROOT_PY="$(pwd -W)"
  fi
  APP_DIR="$PROJECT_ROOT_PY"
  export PYTHONPATH="$PROJECT_ROOT_PY${PYTHONPATH:+;$PYTHONPATH}"
else
  export PYTHONPATH="$PROJECT_ROOT${PYTHONPATH:+:$PYTHONPATH}"
fi

echo "Starting Managed ChatKit backend on http://127.0.0.1:8000 ..."
exec python -m uvicorn --app-dir "$APP_DIR" app.main:app --reload --host 127.0.0.1 --port 8000

