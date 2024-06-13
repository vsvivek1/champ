const mar = function checkMarubozo(element) {
  element.ohlc === element.ohlc.low &&
    (element.last_price * 1.1 <= element.ohlc.high || element.last_price === element.ohlc.high) &&
    this.hours >= 14;

  if (mar) {
    this.cl('MARUBOZU CANDLE FOR', cis.tradingsymbol);
  }
}

import axios from 'axios';
const mutateWithLtp = {

  mounted() {

    this. periodicSettingofPos()
     console.log('hello from mutatewithltpmixin mixin  yyy!');
   },
    methods: {
      closeAndOpenNewTab() {
        const currentURL = window.location.href;
      
        // Open a new tab with the same URL
       // window.open(currentURL, '_blank');
      
        // Close the current window
        window.close();
      },

      periodicSettingofPos(){
        
        setInterval(async()=>{
          this.hasStartedGetLivePositions =true;
          let body={};
          body.accessToken=this.accessToken;
          let url1  =  "/api/getPositions";
         

          
      let pos= await  axios.post(url1,body).then(res=>res.data);

     
     /*  let hasLivetargetFromcis = cis.hasLiveTarget;
      let hasLivePositionFromcis = cis.hasLivePosition; */

      ///look here

      let url  =  "/api/getOrdersPost";
      let orders1= await  axios.post(url,body).then(res=>res.data);
      this.hasStartedGetLivePositions =false;
    
      if(orders1 && orders1.length>0)
{

      let orders=orders1.filter(o=>o.status=='OPEN' && o.filled_quantity!=o.quantity);

      orders.forEach((o)=>{
  
        let cis=this.instruments.find(c=>c.instrument_token==o.instrument_token);


        let cis2=this.instruments.find(c=>c.instrument_token==o.instrument_token 
          && o.transaction_type=='SELL')


        if(cis2){

          this.$set(this.instruments.find(c=>c.instrument_token==o.instrument_token 
            && o.transaction_type=='SELL'),'hasLiveTarget',true)
        }else{
          /* this.$set(this.instruments.find(c=>c.instrument_token==o.instrument_token 
            && o.transaction_type=='SELL'),'hasLiveTarget',false) */

        }
           /*  let hasLivetargetFromcis = cis.hasLiveTarget;
      let hasLivePositionFromcis = cis.hasLivePosition; */

if(cis){

  this.$set(this.instruments.find(c=>c.instrument_token==o.instrument_token),'liveOrder',o);



}
 

      })
    
    
        }
    

    if(pos.day && pos.day.length>0){


  let livePos=   pos .day.filter(d=>
        d.quantity>0 &&
        
        d.exchange=='NFO');
   
        if(livePos && livePos.length>0){

          livePos.forEach((e)=>{

//console.log(e.tradingsymbol)
  let cis=this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol);

   //debugger;
if(cis){
  this.$set(this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol),'livePosition',e);
 

  this.$set(this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol),'hasLivePosition',true);



  // this.$set(cis,'livePositions',e);
   //console.log(cis.livePosition,'cis.livePositions')

 // console.log('cis ivePositions',cis.livePositions )

}else{
 /*  this.$set(this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol),'livePosition',null);
 

  this.$set(this.instruments.find(c=>c.tradingsymbol==e.tradingsymbol),'hasLivePosition',false);
 */


}


})

        }

      }
       
        
    
       
     

        },20*1000)
        this.hasStartedGetLivePositions =false;
      },

     async stopLossprocedure(instrument_token,tradingsymbol,cis,element,hasLivePositionFromcis,last_price) {

   // console.log('from stop loss procedure ');
        //return ;  // have to write stop loss here switch
        let lpCurrent = this.livePositions.find(lp => lp.instrument_token == instrument_token);

       // console.log(lpCurrent,'current position')
        let average_price = -1;

        if (typeof lpCurrent=='undefined') {

          //this.cl('avaerage price not defined for', cis.tradingsymbol);
          average_price = cis.pricePoints.d1.high;
       
       
        } else {

         // console.log(lpCurrent,'lpcurrent')
          average_price = lpCurrent.quantity < 0 ? lpCurrent.sell_price : lpCurrent.buy_price;

        }

       
        this.currentTradingsymbolAverage = { instrument_token, tradingsymbol, average_price };

        if (!this.livePositions.some(lp => lp.instrument_token == cis.instrument_token)) {
         // this.cl('live postition for script is zero');
          return false;
        }

        

        let { high, low } = cis.pricePoints.d1;
        let { bidPrice, offerPrice, count, stopLoss, target, lstPrice, livePnlOffered, quantity } =
          await this.setTargetPricesBasedOnQuantity(cis, element, low, high, instrument_token);

        let hasLiveTarget = count > 0;

        let PlacedReverseOrder = this.instruments.find(i => i.instrument_token == instrument_token).PlacedReverseOrder;


        let hasLivetargetFromcis=cis.hasLiveTarget
      
       
        if (hasLivePositionFromcis && hasLivetargetFromcis) {




          ////proceed for stop losss 
          this.stopLossTargetSwitch(quantity, last_price, high, low, bidPrice, offerPrice, cis, element, livePnlOffered, lpCurrent);
        } else {



          this.cl('NO LIVE TARGETS FOR ', cis.tradingsymbol);

          let lnLive = this.liveOrders.some(lo => lo.instrument_token == instrument_token);

          if (!lnLive) {
            if (PlacedReverseOrder != true && hasLiveTarget != true) {
              this.cl('iam return ning false @7217 means no live targets');
              if (this.manualReverseOrderStart == true) {
                
                // let out  = await this.placeTargetsForSingleScript(instrument_token, quantity);
            
                let  livePnl=0;
                let product='NRML'
                let transaction_type='SELL';

                let qty=lpCurrent.quantity;
                let targetPoint=lpCurrent.price*1.05

               // debugger;


                this.placetargetAndStopLoss(
                  cis,
                  cis.instrument_token,
                  0,
                 product,
                  Math.abs(order.quantity),
                  targetPoint,
                  livePnl,
                  true,
                  transaction_type
              );
            
            
              }
              return false;
            }
          }
        }
    },
      setLiveTargetAndPosition(instrument_token, livePosObject, liveOrderObj) {
        if (typeof livePosObject != undefined && typeof liveOrderObj != undefined) {
            const instrumentToUpdate = this.instruments.find(i => i.instrument_token == instrument_token);
            if (instrumentToUpdate) {
                this.$set(instrumentToUpdate, 'hasLivePosition', true);
                this.$set(instrumentToUpdate, 'hasLiveTarget', true);
                this.$set(instrumentToUpdate, 'liveOrder', liveOrderObj);
                this.$set(instrumentToUpdate, 'livePosition', livePosObject);
                this.cl('SETTING OF LIVE TARGET LIVE POS');
            } else {
                this.cl('Instrument not found for token: ' + instrument_token);
            }
        } else {
            const instrumentToUpdate = this.instruments.find(i => i.instrument_token == instrument_token);
            if (instrumentToUpdate) {
                this.$set(instrumentToUpdate, 'hasLivePosition', false);
                this.$set(instrumentToUpdate, 'hasLiveTarget', false);
                this.$set(instrumentToUpdate, 'liveOrder', null);
                this.$set(instrumentToUpdate, 'livePosition', null);
            }
            this.cl('Live position or live order is not defined.');
        }
    },

      setPreviousPriceAndLastPrice( instrument_token,last_price ){ 



        try { 
          
                if( isNaN( instrument_token )){ 
          
          
                  this.cl( 'is nan issue instriment token in setprevios and last price' )
                  return  false;
                 } 
          
                if( this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     ).length == 0 ){ 
          
                      this.cl( 'is nan issue instriment token in setprevios and last price' )
          
                      return false;
                     } 
          
          
          
          
                this.$set( 
                    this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     )[0],
          
                    "previousPrice",
                              this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     )[0].last_price
                   );
                  

                   this.$set( 
                    this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     )[0],
          
                    "previous_last",
                              this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     )[0].last_price
                   );
        
                  this.instruments.filter( 
                    ( i )  => i.instrument_token  ==  instrument_token
                   )[0].last_price = last_price;
                
          
          
               
          
                  return true;
         }  catch ( error ) { 
          
        
          this.cl( error,'error of set previos price' );
        
          return false
         } 
        
        
             } ,
      async mutateWithLtp(s) {

        if(this.seconds%5!=0){
//console.log('limiting ticks');
          return;
        }

        this.heartBeatAndCurrentCheckDigit();
      

      
        

        //|| this.refreshingTradeStatus
        if (this.hasStartedGetOrders || this.hasStartedGetLivePositions ) {
          this.tradeEntryFlowStatus = 'updating various status on Mount 1';
     /*    console.log('UPDATING VARIOS STATUS  ... NO TRADE TIME',
          this.hasStartedGetOrders,'this.hasStartedGetOrders\n',
          this.hasStartedGetLivePositions,'this.hasStartedGetLivePositions\n',
          this.refreshingTradeStatus,'this.refreshingTradeStatus\n'




          ); */
          //return false;
        }

      //  console.log(s);
        for (let element of s) {

                
          if (!element || !element.instrument_token) {
            this.tradeEntryFlowStatus = 'Element null 4';

            this.cl('ELEMENET EMPTY');
            
            return false;
          }
  
          

          this.tradeEntryFlowStatus = 'Inside mutate with ltp 3';
          const instrument_token = element.instrument_token;
          
         
         

          
          let cis = this.instruments.find(i => i.instrument_token == instrument_token);
         
         

          
  
          if (typeof cis == 'undefined') {
            // console.log(this.instruments,instrument_token,'42',cis)
            this.tradeEntryFlowStatus = 'CIS undefined 5';
           // this.cl('CIS ELEMENT NOT FOUND ISSUE QUITING THIS TICK',instrument_token)
            await this.updateMissingScriptInInstrumetsFile(JSON.stringify([instrument_token]));
            return false;
          }

          let tradingsymbol = cis.tradingsymbol;


          this.currentTradingsymbol = cis.tradingsymbol;
          const lp1 = element.last_price;

          
  
          let ma = this.calculateMovingAverage(cis);
this.$set(cis,'movingAverage',ma)


          let ep = ma;
          let exit = element.ohlc.high * 1.1;
  
         
  
          this.$set(cis,'tick',element)

   
          const last_price = element.last_price;

          if(!this.setPreviousPriceAndLastPrice(instrument_token, last_price))
          {

            this.tradeEntryFlowStatus='Some issue with setting last price and previos last price'
            return false;
          }
          
         let lastSeenHigh=cis.lastSeenHigh;
         

         if(!lastSeenHigh|| element.last_price>lastSeenHigh){

          this.$set(cis,'lastSeenHigh',element.last_price);
         }
         
  


/* console.log(cis.livePosition ,'LIVE POS  @ 290 ',cis.tradingsymbol)
console.log( cis.liveOrder,'LIVE ORDERS @ 291 ',cis.tradingsymbol) */
      
  /* 
          if (typeof livePosObject != 'undefined' && typeof liveOrderObj != 'undefined') {
        this.setLiveTargetAndPosition(instrument_token, livePosObject, liveOrderObj);
          }  */
          
          /* if (cis.livePosition.length != 0 &&
            
            typeof liveOrderObj != 'undefined') {
        this.setLiveTargetAndPosition(instrument_token, livePosObject, liveOrderObj);
          } */

        
          let hasLivetargetFromcis = cis.hasLiveTarget;
          let hasLivePositionFromcis = cis.hasLivePosition;
  
          this.tradeEntryFlowStatus = 'HAS LIVE POSITION CHECK 7';

          //debugger;

if(hasLivetargetFromcis && hasLivePositionFromcis){

let condition=

    element.last_price<element.ohlc.open
/* || element.last_price <cis.lastBuyPrice-10
|| element.last_price <cis.lastBuyPrice*.95 */
|| element.last_price <cis.lastSeenHigh*.90



//debugger;

//&& !cis.lowCandleEntry
if(condition ){

 let  msgx = `SL HIT UPFRONT FROM MUTATE FOR  ${ cis.tradingsymbol } @ ${ last_price }  ON ${ Date() } `
  this.cl( msgx )

  this.flashMessage=msgx;

  this.updateSquareOfforderWithDesiredPrice( 
    cis,
    element,
    false,
    element.last_price
   );
}

}

  //debugger;
          if (hasLivePositionFromcis) {

         this.stopLossprocedure(instrument_token,tradingsymbol,cis,element,hasLivePositionFromcis,last_price);
          }
  
         //this.cl('cis.noTradingNow @142',cis.noTradingNow,cis.tradingsymbol);

          if (cis.noTradingNow == false) {
            
            let inst = cis;
            
           

            this.flashMessage='BEFORE TRADE ENTRY MUTATE';

            this.tradeEntryFlowStatus = 'Reached before  trade Entry';
             this.tradeEntry(instrument_token, inst, cis, element);
          }
        }
      },
      
    },
  };
  
  export default mutateWithLtp;
  