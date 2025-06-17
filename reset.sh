#!/usr/bin/env bash
set -euo pipefail

# If not run as root, re-exec under sudo
if [[ $EUID -ne 0 ]]; then
  echo "🔒 Elevating privileges with sudo…"
  exec sudo bash "$0" "$@"
fi

echo "→ Removing default Nginx vhosts…"
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/conf.d/default.conf

echo "→ Enabling champ.conf…"
ln -sf /etc/nginx/sites-available/champ.conf /etc/nginx/sites-enabled/champ.conf

echo "→ Testing Nginx configuration…"
nginx -t

echo "→ Reloading Nginx…"
systemctl reload nginx

echo "→ Resetting Tailscale Serve…"
tailscale serve reset

echo "→ Starting Tailscale Serve on port 80…"
tailscale serve --bg 80

echo "✅ All done! Your SPA, API and WebSockets are now served under HTTPS."
