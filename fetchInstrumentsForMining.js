const Fs = require('fs');
const Path = require('path');
const { exec } = require('child_process');
const pricePoint = require('./pricePoints');
const ohlc = require('./scraping/ohlc');
const { secondsToHms } = require('./fetchInstrumentsFunctions.js');
const { otherCriteria } = require('./otherCriteria.js');
const { getNearestStrikes_unoptimized } = require('./getNearestStrikes_unoptimized.js');
const { downLoadAllInstrumentsAndReturnJson } = require('./downLoadAllInstrumentsAndReturnJson.js');
const { FILE_LOCATION, instruAll, getSymbols, overnightScripts, writeFinalScriptsTofile, TIMER, overAllTimer, cl, EXPIRY, getBankNiftyExpiry } = require('./FetchInstruments.js');





async function fetchInstrumentsForMining(accessToken) {
	try {



		let csvresult = await downLoadAllInstrumentsAndReturnJson();


		let filterByExpiryLessThanOrEqualToNextThursday = require('./filterByExpiryLessThanOrEqualToNextThursday');


		let jsonObjMultiple = filterByExpiryLessThanOrEqualToNextThursday(csvresult);


		//   console.log(jsonObjMultiple,'jsonObjMultiple')
		//   debugger;
		//   csvresult.filter( j  => ( 
		//     ( 
		//       j.exchange  ==  'NFO' && ( j.expiry  ==  EXPIRY 
		// 		// || j.expiry  ==  getBankNiftyExpiry(  )
		// 	   ) 
		// 	   || j.exchange=='NSE'
		//        )
		//      ))
		let jsonObj1 = jsonObjMultiple;

		let jsonObjAll = csvresult; //.filter( j  => (( j.exchange  ==  'NFO' ) || j.exchange  ==  'NSE' ));


		let jsonObjCommodity = csvresult.filter(j => ((j.exchange == 'MCX')
		));







		//   let fileOutputName  =  Path.resolve( __dirname, FILE_LOCATION,
		//    'instruments.json' )
		let fileOutputName = Path.resolve(FILE_LOCATION,
			'instruments.json');


		//   let jsonObjCommodityFile =  Path.resolve( __dirname, FILE_LOCATION, 'CommodityFile.json' )
		let jsonObjCommodityFile = Path.resolve(FILE_LOCATION, 'CommodityFile.json');

		let f = await new Promise(async (res, rej) => {
			try {
				await Fs.writeFile(fileOutputName, JSON.stringify(jsonObj1), 'utf8', async function (err) {
					if (err) {
						console.log("An error occurred while writing JSON Object to File.");
						rej(false);
						return console.log(err);
					}

					let targetDir = Path.join(FILE_LOCATION + '/instruments.json');

					await Fs.copyFile(FILE_LOCATION + '/instruments.json', targetDir, async (err) => {
						if (err) throw err;

						try {
							await Fs.writeFile(instruAll, JSON.stringify(jsonObjAll), 'utf8');
							res(true);
						} catch (err) {
							console.log("An error occurred while writing JSON Object to File.");
							console.log(err);
							res(false);
						}
					});
				});
			} catch (err) {
				console.log(err);
				res(false);
			}
		});


		console.log('code block of downloading completed');



		let jsonObj2 = [];
		let jsonObjWithOutCriteria = [];


		let a = await getSymbols();



		console.log(accessToken, 'ACCESS TOKEN @285');

		let ohlcs = await ohlc(accessToken, a);

		// console.log( ohlcs );
		let instruments1 = require(FILE_LOCATION + '/instruments.json');
		let instruments = instruments1.filter(i => (i.tradingsymbol.includes('NIFTY'))
			|| i.tradingsymbol.includes('BANKNIFTY')

		); //.slice( 0,10 )


		let strikes1 = await getNearestStrikes_unoptimized(ohlcs, instruments); //.slice( 1,50 );



		console.log(strikes1, 'strikes');

		//process.exit();
		let strikes = strikes1; //.slice( 1,100 );
		let symbols = [];
		let len1 = strikes.length;

		console.log('---------------code block of timer started total strikes', len1);

		let len = len1;
		let intr = setInterval(async () => {
			// var a111 = 0;
			let e = strikes.pop();
			// console.log( e,'e' )
			//////////////////////////////////////////////
			if (typeof e == 'undefined') {
				clearInterval(intr);


				let jsonObj3 = await overnightScripts(jsonObj2);


				console.log(jsonObj2.length, 'json obj len');
				// console.log( 'Now starting new mint ' );
				let write = await writeFinalScriptsTofile(jsonObj3, jsonObjWithOutCriteria);

				console.log('finished ');
				exec('pm2 stop ./server.js;pm2 start ./server.js', (error, stdout, stderr) => {
					if (error) {
						console.error(`Error executing command: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				});
				//res(true)
				//return;
				// fetchInstrumentsForNewMint( accessToken );
				return false;
			}
			len--;

			//////////////////////////////////////////////
			let sec = len * TIMER / 1000;
			let min = sec / 60;
			let sec1 = sec % 60;

			let t = secondsToHms(sec);
			overAllTimer = sec;


			let progress = `${len} , 'left out of ', ${len1} , ' ', ${t} , ' time left', ${e.tradingsymbol} `;


			cl(progress);
			// console.log( len, 'left out of ', len1, ' ', t, ' time left', e.tradingsymbol );
			// printProgress( progress )
			if (e && typeof e != 'undefined') {


				try {

					await setCurrentInstrumentParameters(e);


				} catch (error) {
					console.log(error, 'LINE 353');

					strikes.push(e);
				}


			}




		}, TIMER);










		return true;

		function higherLowsCheck(pricePoints) {




			let { d0, d1, d2, d3, d4, d5, d6, d7 } = pricePoints;

			if ((d1.low > d2.low &&
				d2.low > d3.low)
				||

				(d1.high > d2.high &&
					d2.high > d3.high)
				//&&
				// d3.low>d4.low 
			) {

				return true;
			} else {


				return false;
			}




		}

		async function setCurrentInstrumentParameters(e) {
			let instruAll = require(FILE_LOCATION + '/instrumentsAll.json');

			console.log(accessToken, 'accessToken @ 415');
			let a = new pricePoint(e.instrument_token, accessToken);


			let c = await a.getPricePoints(30, 'day');



			// isHigerLows = higherLowsCheck( c )
			// if( isHigerLows == false ){ 
			// 	return false;
			//  } else{ 
			// 	console.log( e.instrument_token,'passed higher lows' )
			//  } 
			e.pricePoints = c;


			e.SevenDayMaxMin = c.SevenDayMaxMin;
			e.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol} /${e.instrument_token} `;

			let name = e.name;



			if (typeof instruAll.find(i => i.tradingsymbol == e.name) !== 'undefined') {

				let nameinstrumentToken = instruAll.find(i => i.tradingsymbol == e.name).instrument_token;
				let stockChart = `https://kite.zerodha.com/chart/ext/ciq/${e.exchange}/${name} /${nameinstrumentToken} `;
				e.stockChart = stockChart;


			}


			e.seletedBuyingMethod = 'MAX';
			e.enterNowToTrade = false;
			e.PlacedReverseOrder = false;
			e.hasLiveTarget = false;
			e.hasLivePosition = false;

			e.previousPrice = 0;
			e.last_price = 0;

			if (e.pricePoints) {

				let { otherCriteriaCheck, otherCriteriaObj } = otherCriteria(e);
				e.otherCriteria = otherCriteriaObj;
				e.otherCriteriaCheck = otherCriteriaCheck;
				if (otherCriteriaCheck) {
					jsonObj2.push(e);
				} else {
					jsonObjWithOutCriteria.push(e);
				}
			} else {
				console.log(`${e.tradingsymbol} : pricePoints not set, so not pushing`, e.pricePoints);
			}
		}

		async function FunctionProcedureForFutures(e) {
			let instruForFuture = require(FILE_LOCATION + '/instrumentsAll.json');

			let niftyfut = instruForFuture.filter(i => i.name == 'NIFTY' && i.expiry == EXPIRY && i.instrument_type == "FUT")[0];
			let a = new pricePoint(niftyfut.instrument_token, accessToken);
			let c = await a.getPricePoints(7, 'day');

			niftyfut.pricePoints = c;
			niftyfut.SevenDayMaxMin = c.SevenDayMaxMin;

			niftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/${e.exchange}/${e.tradingsymbol}/${e.instrument_token} `;
			niftyfut.seletedBuyingMethod = 'MAX';
			niftyfut.enterNowToTrade = false;
			niftyfut.PlacedReverseOrder = false;


			//  console.log( niftyfut )
			jsonObj2.push(niftyfut);
			jsonObjWithOutCriteria.push(niftyfut);


			let bankniftyfut = instruForFuture.filter(i => i.name == 'BANKNIFTY' && i.expiry == getBankNiftyExpiry() && i.instrument_type == "FUT")[0];




			let abnf = new pricePoint(bankniftyfut.instrument_token, accessToken);
			let cbnf = await abnf.getPricePoints(7, 'day');

			bankniftyfut.pricePoints = cbnf;
			bankniftyfut.SevenDayMaxMin = cbnf.SevenDayMaxMin;

			bankniftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/${e.exchange}/${e.tradingsymbol} /${e.instrument_token} `;
			bankniftyfut.seletedBuyingMethod = 'MAX';
			bankniftyfut.enterNowToTrade = false;
			bankniftyfut.PlacedReverseOrder = false;

			//  console.log( bankniftyfut )
			jsonObj2.push(bankniftyfut);
			jsonObjWithOutCriteria.push(bankniftyfut);
		}

	} catch (error) {
		console.log(error);
		//   const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
		//   const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
		//   console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
	}
}
exports.fetchInstrumentsForMining = fetchInstrumentsForMining;
