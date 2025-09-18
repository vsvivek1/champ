#!/bin/bash
set -euo pipefail

# If you use nvm, uncomment these two lines:
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd /home/think-vivek/champ

{
  echo "----- $(date) -----"
  echo "whoami: $(whoami)"
  echo "pwd: $(pwd)"
  echo "PATH: $PATH"
  which node || true
  node -v || true
} >> /home/think-vivek/champ/newfetchlog.txt 2>&1

/usr/bin/node /home/think-vivek/champ/newFetch.js >> /home/think-vivek/champ/newfetchlog.txt 2>&1

