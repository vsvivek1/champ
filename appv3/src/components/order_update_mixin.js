import {  io  }  from "socket.io-client";
import placeTargetsForLiveScripts from "./placeTargetsForLiveScripts";

const socket  =  io( "http://127.0.0.1:4000",


{ 
    transports: ['websocket'],

 } 
 );
export default {
    mixins:[placeTargetsForLiveScripts],
    
    mounted(){

        console.log('hi from order update mixins');

        socket.on( "order_update", async ( order )  => { 




            ///// 

            if ( order.transaction_type=='BUY' &&
                
                order.status === "COMPLETE" && order.exchange == "NFO" && order.pending_quantity === 0) {
                    //console.clear()

                    console.log('PLACING REVERSE ORDER FROM ORDER UPDATES');

                    let cis = this.instruments.find(i => i.instrument_token == order.instrument_token) ||
                  
                  
                    this.instruAll.find(i => i.instrument_token == order.instrument_token);
                  
                  /*   let hasLivetargetFromcis = cis.hasLiveTarget;
                    let hasLivePositionFromcis = cis.hasLivePosition; */
                  this.$set(cis,'hasLiveTarget',true)
                  this.$set(cis,'hasLivePosition',true)

                  this.$set(cis,'lastBuyPrice',order.price);
                  this.$set(cis,'lastSeenHigh',order.price);


                    // this.placeTargetsForLiveScripts();
                   

                   let targetPoint;
                   if(cis.tick){
                    targetPoint=cis.tick.last_price+10

                   }else{

                    targetPoint= order.price+10
                   }
              
                  
                 let  livePnl=0;
                   let product='NRML'
                   let transaction_type='SELL';

                

                   this.placetargetAndStopLoss(
                    cis,
                    order.instrument_token,
                    0,
                   product,
                    Math.abs(order.quantity),
                    targetPoint,
                    livePnl,
                    true,
                    transaction_type
                );

                //;

               // ;
            }

            if ( order.transaction_type=='SELL' &&
                
                order.status === "COMPLETE" && order.exchange === "NFO" && order.pending_quantity === 0) {
                    //console.clear()
let cis=this.instruments.find(i=>i.instrument_token==order.instrument_token);
if(cis){

    this.$set(cis,'noTradingNow',false)
    this.$set(cis, 'hasLivePosition', false);
    this.$set(cis, 'hasLiveTarget', false);
    this.$set(cis, 'lastSeenHigh', -1);
}

                    
            }
            //console.log(orderUpdates.status,'this is the order update',orderUpdates)
        });
        
    }
}