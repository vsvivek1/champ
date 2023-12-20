function otherCriteria(e) {

	try {


		let retObj;
		let body = Math.abs(e.pricePoints.yesterday.close - e.pricePoints.yesterday.open);
		let candleColor = (e.pricePoints.yesterday.close - e.pricePoints.yesterday.open > 0) ? 'green' : 'red';
		let upperShadow;
		let lowerShadow;
		if (candleColor == 'green') {
			upperShadow = e.pricePoints.yesterday.high - e.pricePoints.yesterday.close;
			lowerShadow = e.pricePoints.yesterday.open - e.pricePoints.yesterday.low;

		} else {
			upperShadow = e.pricePoints.yesterday.high - e.pricePoints.yesterday.open;
			lowerShadow = e.pricePoints.yesterday.close - e.pricePoints.yesterday.low;

		}

		let ob = { body, upperShadow, candleColor, lowerShadow };

		// console.log( ob )
		// && body<= lowerShadow
		if (body == 0) {

			retObj = { 'otherCriteriaCheck': false, 'otherCriteriaObj': ob };
			return retObj;
		}


		if (e.pricePoints.d1.range < e.pricePoints.d2.range

			&& (candleColor == 'red' && body > upperShadow * 2)
			|| (candleColor == 'green' && body > upperShadow * 2)) {



			// return true;  ///temoratry
			// console.log( ob )
			retObj = { 'otherCriteriaCheck': true, 'otherCriteriaObj': ob };
			return retObj;
			tradables.push(e.instrument_token);

		}



		else {

			retObj = { 'otherCriteriaCheck': true, 'otherCriteriaObj': ob };
			return retObj;
		}

	} catch (e) {

		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
		return false;

	}
}
exports.otherCriteria = otherCriteria;
