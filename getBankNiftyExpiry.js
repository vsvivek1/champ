const { getNextThursday } = require('./getNextThursday.js');

function getBankNiftyExpiry() {

	let { bankNifty } = getNextThursday();

	return bankNifty;
}

exports.getBankNiftyExpiry = getBankNiftyExpiry;