#!/usr/bin/env bash
# =============================================================================
#  start.sh — Delin Smart Care startup script for Ubuntu server
#
#  Usage:
#    chmod +x start.sh
#    ./start.sh           # start both frontend (4040) and backend (4041)
#    ./start.sh stop      # stop both processes
#    ./start.sh status    # show running processes
#    ./start.sh logs      # tail logs
#
#  Prerequisites (Ubuntu):
#    sudo apt-get update && sudo apt-get install -y nodejs npm postgresql
#    npm install -g pm2
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/.logs"
mkdir -p "$LOG_DIR"

FRONTEND_PORT=4040
BACKEND_PORT=4041

# ─── Helpers ─────────────────────────────────────────────────────────────────

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌  '$1' not found. Install it first." >&2
    exit 1
  fi
}

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ─── Stop ────────────────────────────────────────────────────────────────────

stop_all() {
  log "Stopping services…"
  if command -v pm2 &>/dev/null; then
    pm2 delete delin-frontend delin-backend 2>/dev/null || true
    pm2 save --force
  fi
  log "Services stopped."
}

# ─── Status ──────────────────────────────────────────────────────────────────

show_status() {
  if command -v pm2 &>/dev/null; then
    pm2 list
  else
    echo "pm2 not installed — cannot show status."
  fi
}

# ─── Logs ────────────────────────────────────────────────────────────────────

show_logs() {
  if command -v pm2 &>/dev/null; then
    pm2 logs --lines 100
  else
    tail -n 100 "$LOG_DIR"/*.log 2>/dev/null || echo "No log files found."
  fi
}

# ─── Start ───────────────────────────────────────────────────────────────────

start_all() {
  check_command node
  check_command npm
  check_command pm2

  log "=== Delin Smart Care — startup ==="
  log "Frontend port : $FRONTEND_PORT"
  log "Backend port  : $BACKEND_PORT"

  # ── 1. Environment files ──────────────────────────────────────────────────
  if [[ ! -f "$SCRIPT_DIR/.env.local" && ! -f "$SCRIPT_DIR/.env" ]]; then
    log "⚠  No .env.local found — copying from .env.example (edit it before production use)"
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env.local"
  fi

  if [[ ! -f "$SCRIPT_DIR/server/.env" ]]; then
    log "⚠  No server/.env found — copying from server/.env.example (fill in secrets before use)"
    cp "$SCRIPT_DIR/server/.env.example" "$SCRIPT_DIR/server/.env"
  fi

  # ── 2. Install dependencies ───────────────────────────────────────────────
  log "Installing frontend dependencies…"
  cd "$SCRIPT_DIR"
  npm install --prefer-offline --no-audit --no-fund

  log "Installing backend dependencies…"
  cd "$SCRIPT_DIR/server"
  npm install --prefer-offline --no-audit --no-fund

  # ── 3. Build frontend ─────────────────────────────────────────────────────
  log "Building frontend…"
  cd "$SCRIPT_DIR"
  npm run build

  # ── 4. Build backend ──────────────────────────────────────────────────────
  log "Building backend…"
  cd "$SCRIPT_DIR/server"
  npm run build

  # ── 5. Run DB migrations ──────────────────────────────────────────────────
  log "Running database migrations…"
  cd "$SCRIPT_DIR/server"
  npx prisma migrate deploy

  # ── 6. Start processes with pm2 ───────────────────────────────────────────
  log "Starting backend on port $BACKEND_PORT…"
  cd "$SCRIPT_DIR/server"
  PORT=$BACKEND_PORT pm2 start dist/server.js \
    --name delin-backend \
    --output "$LOG_DIR/backend-out.log" \
    --error  "$LOG_DIR/backend-err.log" \
    --time

  log "Starting frontend preview on port $FRONTEND_PORT…"
  cd "$SCRIPT_DIR"
  pm2 start npm \
    --name delin-frontend \
    --output "$LOG_DIR/frontend-out.log" \
    --error  "$LOG_DIR/frontend-err.log" \
    --time \
    -- run preview -- --port "$FRONTEND_PORT" --host 0.0.0.0

  pm2 save --force

  log ""
  log "✅  Services started."
  log "   Frontend : http://0.0.0.0:$FRONTEND_PORT"
  log "   Backend  : http://0.0.0.0:$BACKEND_PORT"
  log ""
  log "   Run './start.sh logs'   to tail logs"
  log "   Run './start.sh stop'   to stop all services"
  log "   Run './start.sh status' to see pm2 process list"
}

# ─── Entry point ─────────────────────────────────────────────────────────────

case "${1:-start}" in
  start)  start_all  ;;
  stop)   stop_all   ;;
  status) show_status ;;
  logs)   show_logs  ;;
  *)
    echo "Usage: $0 {start|stop|status|logs}"
    exit 1
    ;;
esac
