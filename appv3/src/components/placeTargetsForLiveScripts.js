import axios from 'axios'
//import vue from 'vue';
//vue.use(axios);
export const placeTargetsForLiveScripts = {
  methods: {


   async getNFOPositions(){

    let net=await this.getRawPositions();

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

      async placeTargetsForLiveScripts() {
     await    this.getRawPositions();

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
          let positions = await this.getNFOPositions()



         
        

          //console.log('live positions numbers from reverse orders',symbols.length,symbols)
          let timer = setInterval(() => {

            console.log('inside timer',positions.length)
              if (positions.length == 0) {
                  clearInterval(timer);
                  this.placingReverseOrderInProgress = false;
                  return;
              }

              let position = positions.pop();

              


             // let p=this.livePositions.pop()
              if (!position) {
                console.log('NO LIVE POSITION FROM TARGETFORLIVESSCRIPTS MIXIN 94',position)
                  return false;
              }

              let quote = quotes[position.instrument_token];
              let upper_circuit_limit = quote.upper_circuit_limit;
              let lower_circuit_limit = quote.lower_circuit_limit;
              let cis = this.instruments.find(i => i.instrument_token == position.instrument_token);

              if (!cis) {
                  this.placingReverseOrderInProgress = false;

                  console.log('return1')
                  return false;
              }

              let entryPrice = position.quantity < 0 ? position.sell_price : position.buy_price;
              let transaction_type = position.quantity > 0 ? "SELL" : "BUY";
              let targetPoint = this.calculateTargetPoint(entryPrice, transaction_type, cis, upper_circuit_limit, lower_circuit_limit);

              if (targetPoint ==false) {
                console.log('return2')
                  this.placingReverseOrderInProgress = false;
                  return false;
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

          }, 333);


      },

      
    
  }
};
