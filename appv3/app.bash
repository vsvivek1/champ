export NODE_OPTIONS=--max-old-space-size=4084
cd ../instruments
rm *.csv
cd ..
cd app
npm run serve
