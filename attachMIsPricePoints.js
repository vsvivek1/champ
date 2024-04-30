

async function attachMIsPricePoints(jsonObj2, accessToken) {

	return;
	return new Promise(async (res, rej) => {

		const interval = 333;
		let delayTimer = setInterval(async () => {

			let misPricePoints1 = new misPricePoints();
			let pp = await misPricePoints1.getMisTargets();

			res(pp);

		}, interval);




	});
}
