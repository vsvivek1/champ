#!/bin/bash
# Adds /chart -> 127.0.0.1:3456 to the champ nginx vhost, then reloads.
set -e
SRC="$(dirname "$0")/champ.conf.new"
DST=/etc/nginx/sites-enabled/champ.conf
BAK="${DST}.bak-$(date +%Y%m%d%H%M%S)"

cp -a "$DST" "$BAK"
cp "$SRC" "$DST"

restore() { echo "restoring $BAK"; cp "$BAK" "$DST"; systemctl reload nginx || true; }

if ! nginx -t; then
    echo "FAILED config test -- restoring backup"
    restore
    exit 1
fi

systemctl reload nginx
sleep 1

# A bare 200 at /chart/ proves nothing: the SPA's `try_files ... /index.html`
# answers 200 for any unmatched path. Check for a chart-only element instead.
if curl -fsS http://localhost/chart/ | grep -q 'tfbox0'; then
    echo "OK: nginx reloaded, /chart/ serves the chart app"
    echo "    https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net/chart/"
else
    echo "FAILED: /chart/ is not serving chartApp (got the SPA index or an error)"
    restore
    exit 1
fi
