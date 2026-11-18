#!/usr/bin/env bash
# =============================================================================
#  start.sh — Delin Smart Care startup script for Ubuntu server
#
#  Commands:
#    ./start.sh install    # build, deploy to /opt/delin, install & enable systemd services
#    ./start.sh uninstall  # stop & remove systemd services
#    ./start.sh start      # start services via systemd (after install)
#    ./start.sh stop       # stop services via systemd
#    ./start.sh restart    # restart services via systemd
#    ./start.sh status     # show systemd service status
#    ./start.sh logs       # tail journald logs for both services
#    ./start.sh dev        # run frontend+backend locally with pm2 (dev mode)
#
#  First-time setup on Ubuntu:
#    sudo apt-get update && sudo apt-get install -y nodejs npm postgresql
#    sudo useradd --system --create-home --home-dir /opt/delin --shell /bin/bash delin
#    sudo chown -R delin:delin /opt/delin
#    sudo -u delin git clone https://github.com/ayadseghairi/smart-hospital /opt/delin
#    sudo /opt/delin/start.sh install
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/.logs"
DEPLOY_DIR="/opt/delin"
SYSTEMD_DIR="/etc/systemd/system"

FRONTEND_PORT=4040
BACKEND_PORT=4041

SERVICES=(delin-backend delin-frontend)

# ─── Helpers ─────────────────────────────────────────────────────────────────

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌  '$1' not found. Install it first." >&2
    exit 1
  fi
}

need_root() {
  if [[ "$EUID" -ne 0 ]]; then
    echo "❌  This command must be run as root (use sudo)." >&2
    exit 1
  fi
}

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ─── Install (build + register systemd) ──────────────────────────────────────

install_services() {
  need_root
  check_command node
  check_command npm

  log "=== Delin Smart Care — install ==="

  # ── 1. Environment files ──────────────────────────────────────────────────
  if [[ ! -f "$DEPLOY_DIR/.env.local" ]]; then
    log "⚠  No .env.local found — copying template (fill in secrets!)"
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env.local"
  fi

  if [[ ! -f "$DEPLOY_DIR/server/.env" ]]; then
    log "⚠  No server/.env found — copying template (fill in secrets!)"
    cp "$DEPLOY_DIR/server/.env.example" "$DEPLOY_DIR/server/.env"
  fi

  # ── 2. Install npm dependencies ───────────────────────────────────────────
  log "Installing frontend dependencies…"
  cd "$DEPLOY_DIR"
  npm install --omit=dev --no-audit --no-fund

  log "Installing backend dependencies…"
  cd "$DEPLOY_DIR/server"
  npm install --omit=dev --no-audit --no-fund

  # ── 3. Build frontend ─────────────────────────────────────────────────────
  log "Building frontend…"
  cd "$DEPLOY_DIR"
  npm run build

  # ── 4. Build backend ──────────────────────────────────────────────────────
  log "Building backend…"
  cd "$DEPLOY_DIR/server"
  npm install --no-audit --no-fund   # need devDeps (tsc) for build
  npm run build
  npm prune --omit=dev               # clean devDeps after build

  # ── 5. Run DB migrations ──────────────────────────────────────────────────
  log "Running database migrations…"
  cd "$DEPLOY_DIR/server"
  npx prisma migrate deploy

  # ── 6. Install systemd unit files ─────────────────────────────────────────
  log "Installing systemd service files…"
  cp "$DEPLOY_DIR/systemd/delin-backend.service"  "$SYSTEMD_DIR/delin-backend.service"
  cp "$DEPLOY_DIR/systemd/delin-frontend.service" "$SYSTEMD_DIR/delin-frontend.service"

  systemctl daemon-reload

  # ── 7. Enable & start ─────────────────────────────────────────────────────
  log "Enabling services (auto-start on boot)…"
  systemctl enable delin-backend delin-frontend

  log "Starting services…"
  systemctl restart delin-backend
  sleep 2
  systemctl restart delin-frontend

  log ""
  log "✅  Installation complete."
  log "   Frontend : http://0.0.0.0:$FRONTEND_PORT"
  log "   Backend  : http://0.0.0.0:$BACKEND_PORT"
  log ""
  log "   ./start.sh status   — check service health"
  log "   ./start.sh logs     — tail live logs"
  log "   ./start.sh restart  — restart after code update"
}

# ─── Uninstall ────────────────────────────────────────────────────────────────

uninstall_services() {
  need_root
  log "Uninstalling Delin Smart Care systemd services…"

  for svc in "${SERVICES[@]}"; do
    systemctl stop    "$svc" 2>/dev/null || true
    systemctl disable "$svc" 2>/dev/null || true
    rm -f "$SYSTEMD_DIR/$svc.service"
  done

  systemctl daemon-reload
  log "✅  Services removed."
}

# ─── Start / Stop / Restart ──────────────────────────────────────────────────

start_services() {
  need_root
  for svc in "${SERVICES[@]}"; do
    log "Starting $svc…"
    systemctl start "$svc"
  done
}

stop_services() {
  need_root
  for svc in "${SERVICES[@]}"; do
    log "Stopping $svc…"
    systemctl stop "$svc"
  done
}

restart_services() {
  need_root
  for svc in "${SERVICES[@]}"; do
    log "Restarting $svc…"
    systemctl restart "$svc"
  done
}

# ─── Status ──────────────────────────────────────────────────────────────────

show_status() {
  for svc in "${SERVICES[@]}"; do
    echo "──────────────────────────────────────"
    systemctl status "$svc" --no-pager -l || true
  done
}

# ─── Logs ────────────────────────────────────────────────────────────────────

show_logs() {
  journalctl -u delin-backend -u delin-frontend -n 100 -f
}

# ─── Dev mode (local, uses pm2) ──────────────────────────────────────────────

dev_start() {
  check_command node
  check_command npm
  check_command pm2

  mkdir -p "$LOG_DIR"

  log "=== Delin Smart Care — dev mode ==="

  if [[ ! -f "$SCRIPT_DIR/.env.local" && ! -f "$SCRIPT_DIR/.env" ]]; then
    log "⚠  No .env.local found — copying from .env.example"
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env.local"
  fi

  if [[ ! -f "$SCRIPT_DIR/server/.env" ]]; then
    log "⚠  No server/.env found — copying from server/.env.example"
    cp "$SCRIPT_DIR/server/.env.example" "$SCRIPT_DIR/server/.env"
  fi

  log "Starting backend (dev) on port $BACKEND_PORT…"
  cd "$SCRIPT_DIR/server"
  PORT=$BACKEND_PORT pm2 start "npm run dev" \
    --name delin-backend \
    --output "$LOG_DIR/backend-out.log" \
    --error  "$LOG_DIR/backend-err.log" \
    --time

  log "Starting frontend (dev) on port $FRONTEND_PORT…"
  cd "$SCRIPT_DIR"
  pm2 start npm \
    --name delin-frontend \
    --output "$LOG_DIR/frontend-out.log" \
    --error  "$LOG_DIR/frontend-err.log" \
    --time \
    -- run dev -- --port "$FRONTEND_PORT" --host 0.0.0.0

  pm2 save --force

  log ""
  log "✅  Dev servers started."
  log "   Frontend : http://localhost:$FRONTEND_PORT"
  log "   Backend  : http://localhost:$BACKEND_PORT"
}

# ─── Entry point ─────────────────────────────────────────────────────────────

case "${1:-}" in
  install)   install_services   ;;
  uninstall) uninstall_services ;;
  start)     start_services     ;;
  stop)      stop_services      ;;
  restart)   restart_services   ;;
  status)    show_status        ;;
  logs)      show_logs          ;;
  dev)       dev_start          ;;
  *)
    echo "Usage: $0 {install|uninstall|start|stop|restart|status|logs|dev}"
    exit 1
    ;;
esac
