#!/bin/bash
# Check if chartHeadless is running, email if not (9 AM Mon-Fri)
if ! pm2 list 2>/dev/null | grep -q "chartMock"; then
    echo "chartHeadless (chartMock) is not running" | \
    mail -s "ALERT: chartMock down at $(date '+%Y-%m-%d %H:%M:%S')" vs.vivek1@gmail.com
fi
