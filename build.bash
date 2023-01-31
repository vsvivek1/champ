pm2 stop ./server.js
#node ./FetchInstruments.js
cd ~/findependence/findiserver/app
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
cd ..
pm2 start ./server.js
