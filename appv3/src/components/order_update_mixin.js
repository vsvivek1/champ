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

                    

//debugger;
                   // console.log('PLACING REVERSE ORDER FROM ORDER UPDATES');

                    let cis = this.instruments.find(i => i.instrument_token == order.instrument_token) ||
                 
                  
                    this.instruAll.find(i => i.instrument_token == order.instrument_token);
                  
                  /*   let hasLivetargetFromcis = cis.hasLiveTarget;
                    let hasLivePositionFromcis = cis.hasLivePosition; */
               
                    if(cis.hasLiveTarget){

                        //console.log(cis.tradingsymbol,'HAS ALREADY GOT A TARGET')

                        return;
                    
                    }
//debugger;
                    // this.placeTargetsForLiveScripts();
                    //debugger;

                   let targetPoint;
                 /*   if(cis.tick && cis.tick.last_price!=0){
                    targetPoint=cis.tick.last_price+5

                   }else{ */


                   if(order.price==0){

                    targetPoint= order.average_price+5
                   }else{

                    targetPoint= order.price+5
                   }
                   

                  //  debugger;
                  /*  */// }
              
                 

/* if(cis.lowCandleEntry){

    targetPoint=cis.lowCandleEntryTarget;
} */

                 let  livePnl=0;
                   let product='NRML'
                   let transaction_type='SELL';

                let  order_type='LIMIT';
                  // debugger;
/* 
                   let arr  =  this.buildOrderArray( 
                    cis.tradingsymbol,
                    transaction_type,
          
                    Math.abs(order.quantity),
                    order_type,
                    targetPoint
                   );
           */
             
                /*   console.log( JSON.stringify( arr ));
          
                  let orderArray  =  [arr];
          
                   let a  =  await this.placeOrder( orderArray ); */


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
 
                this.$set(cis,'hasLiveTarget',true)
                this.$set(cis,'hasLivePosition',true)

                this.$set(cis,'lastBuyPrice',order.price);
                this.$set(cis,'lastSeenHigh',order.price);

                //;

               // ;
            }

            if ( order.transaction_type=='SELL' &&
                
                order.status === "COMPLETE" && order.exchange === "NFO" ) {
                    //console.clear()
let cis=this.instruments.find(i=>i.instrument_token==order.instrument_token);
if(cis){

    this.$set(cis,'noTradingNow',false)
    this.$set(cis, 'hasLivePosition', false);
    this.$set(cis, 'hasLiveTarget', false);
    this.$set(cis, 'lastSeenHigh', -1);

  /*   this.$set(this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol),'hasLiveTar',e);
 

    this.$set(this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol),'hasLivePosition',false);
   */

    if(cis.lowCandleEntry){

        this.$set(cis,'lowCandleEntry',false);
    this.$set(cis,'lowCandleEntryTarget','');
    this.$set(cis,'lowCandleEntryStopLoss','');
    }
  
}

                    
            }
            //console.log(orderUpdates.status,'this is the order update',orderUpdates)
        });
        
    }
}