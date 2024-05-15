import axios from 'axios'
import getCandleStickSignalMixin from './getCandleStickSignal';
//import vue from 'vue';
//vue.use(axios);
export default {

  mixins:[getCandleStickSignalMixin],
  methods: {


   async getNFOPositions(){

    let net=await this.getRawPositions();

    //debugger;

    return net.filter(n=>n.exchange=='NFO');


   },

async getRawPositions(){
    let url  =  "/api/getPositions";
    let obj={}
                // call after get live orders
          
                if( this.hasStartedGetLivePosition == true ){ 
                  this.cl( 'FROM GET POSITION FOR HEALTH, STARTED FETCHING LIVE POS' )
                  return false
                 } 
                this.hasStartedGetLivePositions = true;
               
                
                obj.accessToken  =  this.accessToken;
               let res=await axios.post( url, obj );

               let {data:{net}}=res

               return net;
           // console.log('res is ',net)




},

      async placeTargetsForLiveScripts(s='n') {

      

     await    this.getRawPositions();


     const urlForAll  = "../../../instruments/instrumentsAll.json"
     let instruAll1=await this.requireJson( urlForAll );

     this.instruAll=instruAll1;

     //debugger;

          if (this.placingReverseOrderInProgress) {
              return false;
          }

          this.placingReverseOrderInProgress = true;
          console.log('Trying to place reverse order')

          let orders = await this.getOrders();
          let liveOrderInstruments = this.liveOrders.filter(order => order.transaction_type === "SELL").map(order => order.instrument_token);

         // 

let livePositions=await this.getNFOPositions();
          let liveInstrumentSymbols = livePositions.map(position => parseInt(position.instrument_token));
         // this.liveInstrumentSymbols = liveInstrumentSymbols;

          let quotes = await this.getQuoteFromZerodha(liveInstrumentSymbols);

          let { ReverseOrderPending, noTargetArray } = this.checkReverseOrderTallyAndReturnNoTargetScripts();

          if (!ReverseOrderPending) {

            console.info('no reverse order pending at 25 ,place targets')
            //  return false;
          }


          await this.getPositions();
          let positions1 = await this.getNFOPositions()

          let positions=positions1.filter(p=>p.quantity!=0);



        

          //console.log('live positions numbers from reverse orders',symbols.length,symbols)
          let timer = setInterval(async () => {

            console.log('PLACING REVERTSE ORDERS',positions.length)


              if (positions.length == 0) {
                  clearInterval(timer);
                  this.placingReverseOrderInProgress = false;
                  return;
              }

              let position = positions.pop();

              
         

             // let p=this.livePositions.pop()
              if (!position) {
                console.log('NO LIVE POSITION FROM TARGETFORLIVESSCRIPTS MIXIN 94',position)
                 
                this.placingReverseOrderInProgress = false;
                return false;
              }

              let quote = quotes[position.instrument_token];
              let upper_circuit_limit = quote.upper_circuit_limit;
              let lower_circuit_limit = quote.lower_circuit_limit;
              let cis = this.instruments.find(i => i.instrument_token == position.instrument_token);


             
              if (!cis) {

               
               cis= this.instruAll.find(i => i.instrument_token == position.instrument_token);
               console.log('NO CIS found fetching cis from all insstruments',cis,'here is new cis')
//debugger;

let url=`/api/pricePoints/${position.instrument_token}/accessToken/${this.accessToken}`
            // let pp=  await axios.get(`/api/getPricePoints/accessToken/:${this.accessToken}/token/${position.instrument_token}`)
             
            //debugger;
            let pp
           try {
              pp=  await axios.get(url);
           } catch (error) {
            
console.log(error);
            debugger;
           }
              
          

            debugger;
               
            console.log(cis,'cis fetched',pp,'pp')
            cis.pricePoints=pp;
             console.log(pp,'price points fetched from server')
            // debugger;

                // this.placingReverseOrderInProgress = false;

                  console.log('FETCHIG CIS FROM ALL INSTRUMENTS',cis.tradingsymbol)
                  //return false;
              }
              if (!cis){
                console.log('cis issue still after fetching')
                this.placingReverseOrderInProgress = false;
                return;
              }
              let entryPrice = position.quantity < 0 ? position.sell_price : position.buy_price;
              let transaction_type = position.quantity > 0 ? "SELL" : "BUY";
             // let targetPoint = this.calculateTargetPoint(entryPrice, transaction_type, cis, upper_circuit_limit, lower_circuit_limit);
              let targetPoint //= this.calculateTargetPoint(entryPrice, transaction_type, cis, upper_circuit_limit, lower_circuit_limit);




             // debugger;

             if(
              cis.minuteCandle &&
              cis.minuteCandle.target

            ){

              targetPoint=cis.minuteCandle.target;

              
            }else{


            

                let start  = this.getRequiredTime( 9,15 );
    
                let date=new Date();
    
                let minute=date.getMinutes();
                let hour=date.getHours();
                 let end  = this.getRequiredTime( hour,minute+2 );
    

                 let symbol=cis.instrument_token;

                 let intervel='minute';
    
                //  let intervel = 'minute';
                let url = "/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+this.accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
          
        
    let tradingsymbol=this.instruments.find(i=>i.instrument_token==symbol).tradingsymbol
    
       
                // console.log(this.instruments,'ins')
        
                //  console.log( url,'utl' )
    
          //  return;
          let resultPromise =  await  axios.get( url );
    
          
         
          let data=resultPromise.data;

         // let signal=this.getCandleStickSignal(data)
          let minuteCandle={};
          minuteCandle.data=data;
      minuteCandle.signal = this.getCandlestickSignal(data,cis.tradingsymbol)

      
      //debugger;
     
      this.$set(cis,'minuteCandle',minuteCandle);

         // debugger;

         if(
          
          cis.minuteCandle.signal.target &&
          cis.minuteCandle.signal&&
          cis.minuteCandle.signal.target
        
        ){

          targetPoint=cis.minuteCandle.signal.target;
        }else{

          targetPoint=data[data.length-1].high*1.1
          
          //.high*1.1;

          //debugger

          console.log(cis,cis.tradingsymbol,targetPoint,'targetPoint as minute candle high')
        }

            
              

             
            }
              

              //debugger;

             


              if (targetPoint ==false) {
                console.log('return2 target poitn no')
                  this.placingReverseOrderInProgress = false;
                 // return false;
              }

              let livePnl = position.pnl;
//debugger
              
            /*   this.placetargetAndStopLoss( 
                cis,
                instrument_token,
                element,
                product,
                quantity,
                targetPoint,
                livePnl,
                true,
                transaction_type
               ); */


if(typeof cis.target!='undefined'){
  targetPoint=cis.target

}


              this.placetargetAndStopLoss(
                  cis,
                  position.instrument_token,
                  0,
                  position.product,
                  Math.abs(position.quantity),
                  targetPoint,
                  livePnl,
                  true,
                  transaction_type
              );

          }, 2*1000);

          this.placingReverseOrderInProgress = false;
      },

      
  
  }
};
