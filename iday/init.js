import { connectToDatabase } from '../connectToDatabase.js';
import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import getKiteConnectInstance from '../getKiteConnectInstanceRequire.js';

let kite;

export async function initialize() {
    // Connect to database
    connectToDatabase();

    // Initialize KiteConnect instance
    const accessTokenDoc = await getTodaysAccessToken();
    kite = await getKiteConnectInstance();

    return kite;
}
