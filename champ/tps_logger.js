// tpsLogger.js (ESM)
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'tps_log.json');

function getReadableDateTime() {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  return `${date} ${hour}:${minute}`; // "2025-08-06 09:15"
}

export function appendTPS(cis) {
  if ( !cis?.tps || !cis?.tradingsymbol) return;

  const symbol = cis.tradingsymbol;
  const timestamp = getReadableDateTime();

  let data = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    data = content ? JSON.parse(content) : {};
  }

  data[symbol] = data[symbol] || {};
  data[symbol][timestamp] = cis.tps;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
