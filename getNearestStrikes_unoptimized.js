const { ce_lower_percentage, ce_upper_percentage, pe_upper_percentage, pe_lower_percentage, FILE_LOCATION } = require('./FetchInstruments.js');
const nearestMultiple=require('./nearestMultiple');
function getNearestStrikes_unoptimized(ohlc, instruments) {
	try {



		return new Promise((resolve, reject) => {
			// console.log( 'from neearest strikeds with ohlc1',ohlc )







			currentInstruments = [];

			let len = Object.keys(ohlc).length;

			// console.log( 'objlen',len );
			// return false;
			Object.keys(ohlc).forEach(async (item) => {
				// console.log( 'item',item )
				let symbol = item.split(':')[1];

				// console.log( 'symbol', symbol )
				

				let last_price = ohlc[item].last_price;
				let {nearestAbove,nearestBelow} = nearestMultiple(last_price,50);

				if (symbol == 'NIFTY 50') {
					
					// console.log( 'NIFTY 50', last_price )
				}
				if (symbol == 'NIFTY BANK') {
					// console.log( 'NIFTY BANK', last_price )
					
				}

				let curInstrument = instruments.filter(


					i => {

						if (symbol == 'NIFTY 50') {
							let {nearestAbove,nearestBelow} = nearestMultiple(last_price,50)


							console.log('nifty ',{nearestAbove,nearestBelow})
							symbol = 'NIFTY';
						}


						if (symbol == 'NIFTY BANK') {

							console.log('bank nifty ',{nearestAbove,nearestBelow})

							symbol = 'BANKNIFTY';
						}

						return i.name == symbol;
					}

				).filter(i => {
					

					if (i.instrument_type == 'FUT') {


						///adding both futures
						if (i.name == 'NIFTY' || i.name == 'BANKNIFTY') {

							
							return true;

						}
					}

					
					if (i.instrument_type == 'CE' && i.strike==nearestAbove) {

					
						return true
					
					}

					else if (i.instrument_type == 'PE' && i.strike==nearestBelow) {
return true;
						

								
					}

				}).map(r => {




					r.spot_price = last_price;


					return r;







				});
				// console.log( 'curInstrument',curInstrument )
				currentInstruments.push(...curInstrument);




				len = len - 1;
				if (len == 0) {
					/// currrent positions
					currentInstruments1 = currentInstruments.map(c => {

						if (typeof c.tradingsymbol != 'undefined') return c;

					}





					);


					// console.log( { currentInstruments1 }  )
					currentInstruments = [...currentInstruments1];



					let instruAll = require(FILE_LOCATION + '/instrumentsAll.json');


					let needed = ['NIFTY 50', 'INDIA VIX', 'NIFTY BANK'];


					let segments = instruAll.filter(i => i.segment == 'INDICES' && needed.includes(i.tradingsymbol));


					// .map( j =>j.instrument_token )
					// console.log( symboList.length,'Total stocks ' )
					// console.log( segments,'here' )
					currentInstruments.push(...segments);

					// console.log( currentInstruments,'cur instr' );
					// tradingsymbol: 'OBEROIRLTY22FEB880PE',
					resolve(currentInstruments);

					return;


					// console.log( pos,'pos' )
				}

			});









		});


	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}
}
exports.getNearestStrikes_unoptimized = getNearestStrikes_unoptimized;
