import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import getKiteConnectInstance from '../getKiteConnectInstanceRequire.js';

export let kite;

export async function initializeKiteConnect() {
    const accessTokenDoc = await getTodaysAccessToken();
    kite = await getKiteConnectInstance();
    return kite;
}