export const placeTargetsForLiveScripts = {

    methods:{
        async placeTargetsForLiveScripts() {


        
      
      if(this.placingReverseOrderInProgress==true){
      
 
      
        // let code='reverseOrderBeingPlaced';
        // let msg='reverse order is being placed please wait...'
        // // this.triggerAlert(code,msg)
        
        return false;
      }
      
      this.placingReverseOrderInProgres=true;
      
      //// reverseOrder //reverseorder
      let o=await this.getOrders();
      
      

      let liveOrderInstruments=this.liveOrders.filter(o2=>o2.transaction_type=="SELL").map(o1=>o1.instrument_token);
      
    
      
await this.getPositions();
      
      

      
            let liveInstrumentSymbols = this.livePositions.map(
                    (a) => parseInt(a.instrument_token)
                  ); 
      
      
            
                  
                this.liveInstrumentSymbols = liveInstrumentSymbols
      
      
      
       let quotes=await this.getQuoteFromZerodha(liveInstrumentSymbols);
      
      
      
      

      
      
      
      
              
              let pos=this.livePositions.length;
      
              if(pos==0){
       this.cl('no live positions for the script')
                return false
              }
      
      
      /// call after refreshordeStatus
      
         let {ReverseOrderPending,noTargetArray} =  
          this.checkReverseOrderTallyAndReturnNoTargetScripts()
      
      
      
            if (!ReverseOrderPending){
      
      
      
              ///checkStoplOss
      this.cl('reverse order tallied')  /// change with oindividual
               return false;
            }
      
       
      
         
      
            
      
            let symbols = [...this.livePositions]//.filter(lp=>lp.quantity>0)];
      
            let ln = symbols.length;
      
            if (ln == 0) {
              this.cl("livePositions symbol length 0 returning");
              this.placingReverseOrderInProgress == false;
              return false;
            }
      
      
      
            if (typeof symbols == "undefined") return false;
           
      
            return new Promise((res, rej) => {
              let output = [];
      
              let timer = setInterval(() => {
         
                  if(symbols.length==0){
      
                  
      return;
      }
                let e = symbols.pop();
      
      
             
      
                let quote=quotes[e.instrument_token];
                let uck=quote.upper_circuit_limit;
                let lck=quote.lower_circuit_limit;
                
      
               
                let cis=this.instruments.find(i=>i.instrument_token==e.instrument_token);
      
      
      
                if (typeof e == "undefined") {
                
                  
                  clearInterval(timer);
                  this.placingReverseOrderInProgress = false;
                  res(output);
                  return;
                }
      
                let instrument_token = e.instrument_token;

               
      
                if(liveOrderInstruments.includes(instrument_token)){
      
      // this.cl('alrady have reverse order',instrument_token)
      
      // continue;
                }
      
                if(!liveOrderInstruments.includes(instrument_token)){
      
      
               
      
         
      
             
      
                if (typeof cis == "undefined") {
                  this.placingReverseOrderInProgress == false;
                  return false;
                }
      
               
      
                let quantity = e.quantity;

               
      
                if (quantity == 0) {
                  this.placingReverseOrderInProgress == false;
                  return;
                }
      
                ///if has liver order or has reverse order placed /// return
      
                /// fire a target
                let
                  transaction_type,
                  rangeBreakOut,
                  high,
                  targetPoint,
                  PlacedReverseOrder;
      
      
      
              
      
                  // this.getLatestPricePoints(instrument_token);;
      
                let upperBreakOutTarget;
      
                PlacedReverseOrder = this.instruments.find(
                  (i) => i.instrument_token == instrument_token
                ).PlacedReverseOrder;
      
      
                // let upper_circuit_limit = e.quotes.upper_circuit_limit
                ;
      
   
                this.cl(e.quotes,'e.quotes',uck,'uck');
      
                // return;
                let hasLiveTarget;
      
             if (quantity > 0) {
                  transaction_type = "SELL";
      
                  // upperBreakOutTarget=cis.pricePoints.d1.rangeBreakOutTarget;
                  upperBreakOutTarget=Math.round(cis.pricePoints.d1.high*1.1,1);
                 
                  quantity = Math.abs(e.quantity);
                 
             
      
                  hasLiveTarget  = this.liveOrders.some(
                    (i) =>
                      i.instrument_token == instrument_token &&
                      i.transaction_type == "SELL"
                  );
      
           
      
      
      
      
      
                  if(typeof typeof upperBreakOutTarget!='undefined' && typeof uck!='undefined'  ){
                    targetPoint =Math.min(upperBreakOutTarget,uck)
      
      
                  }else 
      if(typeof upperBreakOutTarget=='undefined'){
      
        targetPoint=uck
      }else if(typeof uck=='undefined' ){
      
        targetPoint =upperBreakOutTarget
      
      }
      
      
      
         
       this.cl(upperBreakOutTarget,cis.pricePoints.d0.high,'here dk uck todays high',uck,lck,cis.tradingsymbol)
      
                  
                  
                }

                if(quantity<0){

                  this.cl('qty<0')

                  transaction_type = "BUY";
      
                  quantity = Math.abs(e.quantity);


                 
             
      
                  hasLiveTarget  = this.liveOrders.some(
                    (i) =>
                      i.instrument_token == instrument_token &&
                      i.transaction_type == "BUY"
                  );
      
           
                  if(quote && quote.ohlc && quote.ohlc.open){

                    targetPoint=quote.ohlc.open
                 this.cl('QUOTE PRESENT SO USING THAT FOR SHORT COVERING for ',cis.tradingsymbol,' at ',targetPoint);
                    

                  }else if(!typeof cis=='undefined'){

                  

                    targetPoint=cis.pricePoints.d1.low;
                 this.cl('QUOTE ABSENT  SO USING CIS FOR SHORT COVERING',targetPoint,cis.tradingsymbol)





                  }
      

                  // targetPoint=
      
      
      
        
      
    


                }
      
               
      
                if (
                  PlacedReverseOrder == true ||
                 
                  hasLiveTarget == true
                ) {
      
      
      
      
      
      
      
      
                  this.placingReverseOrderInProgress == false;
      
              
      
      
      
      
      
      
                  return false;
                }
      
      let hasLivetgt=cis.hasLiveTarget;
      let hasLivePos=cis.hasLivePosition;
      
      if(hasLivetgt){
      
 
        return false
      }
      
      if(!hasLivePos){
      

      return false
      }
      
      
      
                let element = 0;
                let product = e.product;
                let livePnl = e.pnl;
      
           
      
                output.push(cis.tradingsymbol);
      
                // this.cl(
                //   "palcing reverse1 order from timer script",
                //   cis.tradingsymbol,
                //   "high,upper_circuit_limit",
                //   high
                
                // );
      
      
                 let reverseOrder=true;
      
      // this.cl({targetPoint})
      
      // this.cl({targetPoint},'tpt')
      
      let {target}=this.getAverageClosingValue(cis);
      



      targetPoint=target;
      
      
     if (quantity>0) {
       try {
           let lo=this.livePositions.find(i=>i.instrument_token==instrument_token)
           let avg=lo.buy_price;
 
 
 
 
       
         let tgt1
         if((this.hours==15 && this.minutes>30)|| this.hours>15 || this.hours<9 || (this.hours==9 && this.minutes<15)
         
         ){
       
           tgt1=avg*2.5;
       
         }else{
       
            tgt1=avg*2;
       
         }
 
 
 if(avg<=cis.pricePoints.d1.low){
 
   tgt1=cis.pricePoints.d1.high*99;
 
 
 }
 
 
        
         let tgt=tgt1.toFixed(1)
        
       
         // this.cl(uck,'uck');
 
 
 
         targetPoint=Math.min(tgt,uck);
       
       } catch (error) {
       
       
         console.log('target error',error)
           
       
       
       }
     }
      
      

/// setting targets for sell quantity
if(quantity<0){

  transaction_type='BUY';

  try {
    let lo=this.livePositions.find(i=>i.instrument_token==instrument_token)
    let avg=lo.sell_price;
  
  let tgt1
  if((this.hours==15 && this.minutes>30)|| this.hours>15 || this.hours<9 || (this.hours==9 && this.minutes<15)
  
  ){
  
    tgt1=avg/2
  
  }else{
  
     tgt1=avg/2
  
  }
  
  let tgt=tgt1.toFixed(1)
  
  
  // this.cl(uck,'uck');
  
  
  
  targetPoint=tgt
  
  } catch (error) {
  
  
  console.log('target error',error)
    
  
  
  }


}





/// setting targets for sell quantity



      
      // let storedTarget=this.retrieveTradeDetailsInLocalStorage(cis.tradingsymbol);
      
      // if(storedTarget!==false){
      
      //   console.log("taking target from stored ");
      
      // targetPoint=storedTarget.target;
      
      // }
      
                this.placetargetAndStopLoss(
                  cis,
                  instrument_token,
                  element,
                  product,
                  quantity,
                  targetPoint,
                  livePnl,
                  true,
                  transaction_type
                );
      
      
                if(PlacedReverseOrder==true){
      
      this.cl('reverse order complete reseting plaxe reverorder abd nd ENTER NOW TO TRADE ')
      this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
          PlacedReverseOrder=false;
      
               this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
          enterNowToTrade=false; ///for getting new orders 
      
      }
      
      
      
              }
      
              }, 333);
            });
          },


    }
};