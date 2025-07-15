 export async function  setBuyPriceAndTargetPriceFromCompletedBuyOrder(cis,kite){


let res= await kite.getPositions();
let orderResponse= await kite.getOrders();
global.orders=orderResponse;
//global.positions=res;
//console.log('setBuyPriceAndTargetPriceFromCompletedBuyOrder',global.orders.length,global.positions.length);
global.positions=res.day; 


if(!global.positions) global.positions=res.net;

let pos=global.positions.find(p=>p.tradingsymbol==cis.tradingsymbol);
let qty=pos.quantity;

let transaction= qty>0?'BUY':'SELL';

if(qty==0){
  console.warn('No position found for', cis.tradingsymbol);
  return;
}


if(global.instrumentName!=cis.name) return;


        if (!cis.buy_price || isNaN(cis.buy_price)) {
            const a = global.orders
              .filter(o => o.instrument_token == cis.instrument_token && o.status == 'COMPLETE' && o.transaction_type == transaction)
              .sort((a, b) => new Date(b.exchange_update_timestamp) - new Date(a.exchange_update_timestamp));

              
        
            if (a[0]) {
              cis.buy_price = a[0].average_price;
            } else {
              console.warn(`No completed buy order found for ${cis.tradingsymbol}`);

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