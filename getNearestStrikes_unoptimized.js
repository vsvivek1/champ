const { ce_lower_percentage, ce_upper_percentage, pe_upper_percentage, pe_lower_percentage, FILE_LOCATION } = require('./FetchInstruments.js');

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
				let last_price_max = ohlc[item].last_price * 1.03;
				let last_price_min = ohlc[item].last_price * 0.97;

				let last_price = ohlc[item].last_price;


				if (symbol == 'NIFTY 50') {
					// console.log( 'NIFTY 50', last_price )
				}
				if (symbol == 'NIFTY BANK') {
					// console.log( 'NIFTY BANK', last_price )
				}

				let curInstrument = instruments.filter(


					i => {

						if (symbol == 'NIFTY 50') {

							symbol = 'NIFTY';
						}


						if (symbol == 'NIFTY BANK') {

							symbol = 'BANKNIFTY';
						}

						return i.name == symbol;
					}

				).filter(i => {
					// console.log( 'i.name',i.name )

					if (i.name == 'NIFTY') {
						// console.log( 'NIFTY', i.tradingsymbol, last_price )
					}
					if (i.name == 'BANKNIFTY') {
						// console.log( 'NIFTY BANK', i.tradingsymbol, last_price )
					}



					if (i.instrument_type == 'FUT') {

						if (i.name == 'NIFTY' || i.name == 'BANKNIFTY') {

							// console.log( 'its future', i.tradingsymbol )
							return true;

						}
					}

					// console.log( 'i.instrument_type',i.instrument_type )
					if (i.instrument_type == 'CE') {


						/// if ce strike between 1.05 pc and 1.1 pc
						//if pe between strike .95 to .9
						//           console.log( "variable", variable );
						// if ( i.strike < last_price_max && i.strike > last_price_min ) 
						// let ce_upper_percentage = 1;
						// let ce_lower_percentage = .97;
						if (i.strike > last_price * ce_lower_percentage &&
							i.strike < last_price * ce_upper_percentage)
						// console.log( 'ceeeee yeee' )
						{


							if (i.name == 'NIFTY') {
								// console.log( 'NIFTY 50', i.tradingsymbol )
							}
							if (i.name == 'BANKNIFTY') {
								// console.log( 'NIFTY BANK', i.tradingsymbol )
							}

							return true;
						}
					}

					else if (i.instrument_type == 'PE') {

						// console.log( 'pee yeee' )
						// let pe_upper_percentage = 1.03;
						// let pe_lower_percentage = 1;
						// if ( i.strike < last_price_max && i.strike > last_price_min ) { 
						if (i.strike < last_price * pe_upper_percentage && i.strike > last_price * pe_lower_percentage) {


							if (i.name == 'NIFTY') {
								// console.log( 'NIFTY 50', i.tradingsymbol )
							}
							if (i.name == 'BANKNIFTY') {
								// console.log( 'NIFTY BANK', i.tradingsymbol )
							}


							return true;
						}
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
