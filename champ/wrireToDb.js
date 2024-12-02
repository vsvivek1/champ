import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Logs a single tick into the tick_logs table.
 *
 * @param {Object} cis - The tick data to log.
 * @param {string} cis.tradingsymbol - The script name (e.g., 'NIFTY').
 * @param {Object} cis.tick - The tick data object.
 * @param {number} cis.tick.last_price - The tick price (e.g., 17250.5).
 * @param {number} cis.tick.volume - The tick volume (e.g., 1000).
 */
export async function writeTickToDB(cis) {
  try {

    //console.log(cis.tick);
    
    await prisma.tickLog.create({
      data: {
        scriptName: cis.tradingsymbol,
        price: cis.tick.last_price,
        volume: cis.tick.volume_traded,
        tickTime: new Date(),
        cis:cis // Default to current time if not provided
      },
    });
  //  console.log(`Logged tick: ${cis.tradingsymbol}, Price: ${cis.tick.last_price}, Volume: ${cis.tick.volume}`);
  } catch (error) {
    console.error('Error logging tick:', error);
  }
}

// Example continuous tick logging function


// Graceful shutdown
/* process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
}); */

// Main entry point
/* (async () => {
  console.log('Starting tick logger...');
  await logTicksContinuously();
})();
 */