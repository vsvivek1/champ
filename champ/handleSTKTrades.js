export function handleSTKTrades(cis, kite) {









    if (cis.tick.volume_traded * cis.tick.last_price > 100 * 10 * timeFactor * global.tradingMaxAmount) {
        // Trading conditions met
    } else {
        // Block low volume shares

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
            
        }

          cis.returnPoints ='low volume';
        return;
    }

    let m = global.margins;

    if (cis.tick.last_price < cis.tick.ohlc.open && global.hours == 9 && global.minutes < 30 && global.instrumentName == 'STK') {
        console.log('Shorting due to price drop', cis.tradingsymbol);
        if (global.seconds % 15 == 0) {
            console.log(m.equity.net, 'm.equity.net', cis.tradingsymbol, 'short');
        }

        cis.shortTrading = true;
        executeShorting(cis, kite, cis.tick.last_price);
        return;
    }

    const pivotValues = Object.values(cis.pricePoints.pivotPointObject);

    if (cis.tick.last_price > cis.tick.ohlc.open && global.hours == 9 && global.minutes < 30 && global.instrumentName == 'STK') {
        if (
            cis &&
            !cis.ordered &&
            cis.tick &&
            cis.pricePoints &&
            cis.pricePoints.d1 &&
            cis.tick.last_price > cis.pricePoints.d1.low &&
            cis.pricePoints.d1.range &&
            global.hours == 9 &&
            global.minutes < 30
        ) {
            cis.stockTrade = true;
            cis.shortTrading = false;
            executeBuy(cis, kite, cis.tick.last_price);
        }
    }

    if (cis.tick.last_price < cis.tick.ohlc.open) {


        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
              cis.returnPoints ='below Open';
        }
        return;
    }

    if (cis.tick.last_price > cis.tick.ohlc.open) {
        // if (global.seconds % 25 == 0) {
        //     console.log('Health near handle position', cis.tradingsymbol, 'above open', global.instrumentName);
        // }

        if (!cis.ordered && global.hours == 9) {
            cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
            cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
            cis.inbuiltTarget = true;
            cis.inbuiltStopLoss = true;
            cis.buyStrategy = 'aboveOpenAt920';
            let p = Math.ceil(cis.tick.last_price);
            executeBuy(cis, kite, p);
        }

        if (!global.isAbove.includes(cis.tradingsymbol)) {
            global.isAbove.push(cis.tradingsymbol);
        }
    }

    if (
        cis.minuteData &&
        cis.tick.last_price > cis.tick.ohlc.open &&
        cis.minuteData.slice(-1)[0].low < cis.tick.ohlc.open &&
        global.hours == 9
    ) {
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        cis.buyStrategy = 'aboveOpenAt920';
        let p = Math.ceil(cis.tick.last_price);
        executeBuy(cis, kite, p);
    }
}
