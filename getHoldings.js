const { KiteConnect, api_key } = require('./FetchInstruments');


async function getHoldingInstruments(access_token) {
	try {
		const kc = new KiteConnect({
			api_key: api_key,
			access_token: access_token
		});

		const positions1 = await kc.getPositions();

		const positions=positions1.net.filter(p=>p.exchange=='NFO' && p.quantity!=0)

		
		return positions.map(p => p.tradingsymbol);
	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}
}
exports.getHoldingInstruments = getHoldingInstruments;
