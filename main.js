let AccesTocken = require('./models/AccessTokens');
const { connectToDatabase } = require('./connectToDatabase.js');
const { fetchInstrumentsForMining } = require('./fetchInstrumentsForMining.js');
const { today } = require('./FetchInstruments.js');


async function main() {
	try {
		// Connect to MongoDB
		const isConnected = await connectToDatabase();
		if (!isConnected) {
			console.log('Failed to connect to MongoDB');
			return;
		}

		
		// Now MongoDB is connected, proceed with your logic
		// Fetch today's access token and perform operations
		//const today = new Date(); // Assuming 'today' is defined somewhere
		const accessTokenDoc = await AccesTocken.findOne({ 'date': today }, 'access_token');
		if (!accessTokenDoc) {
			console.log("Access token not found for today");
			return;
		}

		const access_token = accessTokenDoc.access_token;
		console.log(access_token, 'access token from here');
		await fetchInstrumentsForMining(access_token);

	} catch (error) {
		console.log('Error in main function:', error);
	}
}
exports.main = main;
