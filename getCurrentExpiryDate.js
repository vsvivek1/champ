const { getNextThursday } = require('./getNextThursday.js');
const { getLastThursdayOfMonth } = require('./FetchInstruments.js');

function getCurrentExpiryDate() {
	// const moment  =  require( 'moment' );


	return '2023-12-14';
	let { nifty } = getNextThursday();
	return nifty;
	// let m = moment(  );
	return "2023-11-02";

	const lastThursday = getLastThursdayOfMonth(m);
	console.log(`Last Thursday of the month: ${lastThursday} `);



	return lastThursday;
}
exports.getCurrentExpiryDate = getCurrentExpiryDate;
