const pricePoint = require('./pricePoints');
const { getHoldingInstruments } = require('./getHoldings.js');
const { access_token, FILE_LOCATION } = require('./FetchInstruments.js');

function overnightScripts(jsonObj2) {


	return new Promise(async (res, rej) => {






		let overNights = [];
		let pos = await getHoldingInstruments(access_token);


		if (typeof pos == 'undefined') {

			console.log('failed to load holdings line@1002');
			return;
		}

		let posln = pos.length;

		console.log('total overnight ', posln);


		let PostionsTimer = setInterval(async () => {


			let e = pos.pop();
			posln--;



			if (typeof e == 'undefined') {
				console.warn('CLEARING POSITION FOR OVERNIGHT SCRIPTS');
				clearInterval(PostionsTimer);

				res(jsonObj2);

				console.log('where am i', jsonObj2.length);
				return false;
			}
			try {

				console.log(' overnight left', posln, 'e', e);
				let instruAll = require(FILE_LOCATION + '/instrumentsAll.json');

				let ln = jsonObj2.find(ci => ci.tradingsymbol == e);




				if (typeof ln == 'undefined') {


					console.log(' %s ABSENT IN TODAYS SCRIPT  ', e);

					let i = instruAll.filter(i => i.tradingsymbol == e)[0];
					let a = new pricePoint(i.instrument_token, access_token);
					let c = await a.getPricePoints(7, 'day');



					if (typeof c == 'undefined') {

						console.log('big problem with price points');

						return false;
					}
					// console.log( c,'c' )
					i.pricePoints = c;
					i.SevenDayMaxMin = c.SevenDayMaxMin;

					i.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${i.tradingsymbol} /${i.instrument_token} `;
					i.seletedBuyingMethod = 'MAX';
					i.enterNowToTrade = false;
					i.PlacedReverseOrder = false;

					console.log('pushing ', e, 'the overnight script');
					jsonObj2.push(i);


				} else {

					console.log('Instrument ', e, 'Found no issues');
				}

			}

			catch (error) {

				const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
				const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

				console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
				console.log(error, 'error of position check');
			}








		}, 505); //pos for each





		// res( true )
	});
}

exports.overnightScripts = overnightScripts;