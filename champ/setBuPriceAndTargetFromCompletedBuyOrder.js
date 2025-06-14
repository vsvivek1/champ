 export function setBuyPriceAndTargetPriceFromCompletedBuyOrder(cis){


        if (!cis.buy_price || isNaN(cis.buy_price)) {
            const a = global.orders
              .filter(o => o.instrument_token == cis.instrument_token && o.status == 'COMPLETE' && o.transaction_type == 'BUY')
              .sort((a, b) => new Date(b.exchange_update_timestamp) - new Date(a.exchange_update_timestamp));

              
        
            if (a[0]) {
              cis.buy_price = a[0].average_price;
            } else {
              console.warn(`No completed buy order found for ${cis.tradingsymbol}`,cis);

              process.exit();
              return;
            }
        
            if (!cis.targetPrice || isNaN(cis.targetPrice)) {
              cis.targetPrice = cis.buy_price + global.targetPoints;
            }
          }

          if(!cis.targetPrice){

            if(!cis.averageRange|| isNaN(cis.buy_price)){

                console.log(cis.buy_price,'is buy price sss')

                throw 'Average range no set pls look'
            }

            cis.targetPrice=cis.buy_price+cis.averageRange;

        
          }

          return;
    }