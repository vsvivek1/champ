const { FILE_LOCATION } = require('./FetchInstruments.js');





async function getSymbols() {
	try {



		let instruments = require(FILE_LOCATION + '/instruments.json');

		let st = instruments.filter(i => i.exchange == 'NFO')
			.map((i) => i.name)
			.filter((x, i, a) => a.indexOf(x) == i);

		let st2 = instruments
			.map((i) => i.instrument_token)
			.filter((x, i, a) => a.indexOf(x) == i);

		let instTockens = st.map((s) => {

			let ar = instruments.filter(
				(i) => i.tradingsymbol == s && i.exchange == "NSE"
			);

			if (typeof ar[0] != "undefined") {
				let instrument_token1;
				if (ar.length) {
					let { instrument_token } = ar[0];
					instrument_token1 = instrument_token;
				} else {
					instrument_token1 = 0;
				}

				return instrument_token1;
			}

		});


		let symboList = st.map((s) => {
			// console.log( 'from get symbls', s )

			if (s == 'NIFTY') {
				s = "NIFTY 50";

			}

			if (s == 'BANKNIFTY') {
				s = "NIFTY BANK";

			}
			return "NSE:" + s;
		}).filter((x, i, a) => a.indexOf(x) == i);;




		let instruAll = require(FILE_LOCATION + '/instrumentsAll.json');


		let needed = ['NIFTY 50', 'INDIA VIX', 'NIFTY BANK'];


		let segments = instruAll.filter(i => i.segment == 'INDICES' && needed.includes(i.tradingsymbol))


			.map(j => j.tradingsymbol);


		console.log(symboList.length, 'Total stocks ');
		console.log('segments length', segments.length);


		// console.log( segments )
		symboList.push(...segments);

		// console.log( symboList.length,'Total stocks after ' )
		return symboList;



		// let f =  await  this.getOHLC( this.accessToken, symboList );
		// let t = await  this.getNearestStrikes(  );
		// return st;
	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}
}
exports.getSymbols = getSymbols;