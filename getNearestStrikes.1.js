function getNearestStrikes(ohlc, instruments) {
	try {

		const peUpperPercentage = 1;
		const peLowerPercentage = 0.97;
		const ceUpperPercentage = 1;
		const ceLowerPercentage = 0.97;



		return Promise.resolve(
			Object.entries(ohlc).reduce((currentInstruments, [item, value]) => {


				let symbol = item.split(':')[1];
				let lastPriceMax = value.last_price * peUpperPercentage;
				let lastPriceMin = value.last_price * peLowerPercentage;
				let lastPrice = value.last_price;

				let curInstrument = instruments.find(i => {
					if (symbol == 'NIFTY 50') {
						symbol = 'NIFTY';
					}
					if (symbol == 'NIFTY BANK') {
						symbol = 'BANKNIFTY';
					}
					return i.name == symbol;
				});



				console.log(instruments.length);

				return;
				// console.log( curInstrument )
				if (curInstrument) {


					console.log();


					if (curInstrument.instrument_type == 'FUT' && (curInstrument.name == 'NIFTY' || curInstrument.name == 'BANKNIFTY')) {

						console.log(curInstrument.tradingsymbol);


						curInstrument.spot_price = lastPrice;
						currentInstruments.push(curInstrument);
					} else if (curInstrument.instrument_type == 'CE' && curInstrument.strike > lastPrice /** ceLowerPercentage && curInstrument.strike < lastPrice * ceUpperPercentage*/) {

						console.log(curInstrument);

						curInstrument.spot_price = lastPrice;
						currentInstruments.push(curInstrument);
					} else if (curInstrument.instrument_type == 'PE' && curInstrument.strike < lastPrice /** peUpperPercentage && curInstrument.strike > lastPrice * peLowerPercentage*/) {
						curInstrument.spot_price = lastPrice;

						console.log(curInstrument);
						currentInstruments.push(curInstrument);
					}
				}
				return currentInstruments;
			}, [])



		);

	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}
}
