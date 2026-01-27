
import pricePoints from './pricePoints';

async function setPricePointsToInstrument( option, fullJson,accessTokenDoc) {

    
    return new Promise(async (resolve, reject) => {
        try {

            let pp=new pricePoints(option.instrument_token,accessTokenDoc);
    await  pp.initiateKiteConnect()
    console.log(option.instrument_token,'instru token inside seting function');
            let c = await pp.getPricePoints(7, 'day');
            option.pricePoints = c;
            option.SevenDayMaxMin = c.SevenDayMaxMin;

            option.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${option.tradingsymbol}/${option.instrument_token}`;
            option.selectedBuyingMethod = 'MAX';
            option.buyNow = false;

            option.noTradingNow=false;
            option.canTakeFreshTrade=true;
            option.hasStartedGetOrders=false
            option.hasStartedGetLivePositions=false
            option.refreshingTradeStatus=false
            option.hasLiveTarget =false
            option.hasLivePosition =false
            option.hasLiveOrder=false;
            

            console.log('pushing option', option.tradingsymbol,option.expiry);
            fullJson.push(option);
            console.log('new length', fullJson.length);

            //console.log(fullJson.length,'full json len',selectedOptions.length)
            writeJsonToFile(fullJson,'./appv3/shared/instruments/instrumentsForMining.json')
            writeJsonToFile(fullJson,'./appv3/src/assets/instruments/instrumentsForMining.json')
            

            resolve(fullJson);
        } catch (error) {
            reject(error);
        }
    });
}
