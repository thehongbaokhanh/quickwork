#!/bin/sh
set -eu

: "${PORT:=10000}"
: "${APP_PORT:=8080}"

export HOST="${HOST:-0.0.0.0}"
export PORT
export APP_PORT

api_pid=""
web_pid=""

terminate() {
  trap - INT TERM EXIT
  if [ -n "$web_pid" ]; then
    kill -TERM "$web_pid" 2>/dev/null || true
  fi
  if [ -n "$api_pid" ]; then
    kill -TERM "$api_pid" 2>/dev/null || true
  fi
  wait "$web_pid" 2>/dev/null || true
  wait "$api_pid" 2>/dev/null || true
}

trap terminate INT TERM EXIT

./quickwork-api &
api_pid=$!

node .output/server/index.mjs &
web_pid=$!

set +e
wait -n "$api_pid" "$web_pid"
status=$?
set -e

exit "$status"
