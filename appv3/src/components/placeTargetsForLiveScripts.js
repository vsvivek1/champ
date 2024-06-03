import axios from 'axios'
import getCandleStickSignalMixin from './getCandleStickSignal';

//import instruments from '/instruments/instrumentsForMining.json?import.'
import instruments from '../assets/instruments/instrumentsForMining'
import insAll from '../assets/instruments/instrumentsAll.json';


//import vue from 'vue';
//vue.use(axios);
export default {

    mounted(){


        this.instruments=instruments;
        let x=this.instruments

    },

  mixins:[getCandleStickSignalMixin],
  methods: {


   async getNFOPositions(){

    let net=await this.getRawPositions();

    //debugger;

    if(typeof net!='undefined'){

      return net.filter(n=>n.exchange=='NFO');
    }

    


   },


  async  getOrders(  ) { 
    let url = "/api/getOrders/" + this.accessToken;

 let o=  await  axios.get(url).then(res=>res.data)//.filter(a=>a.);
     return o;
 

    
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

 delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
},

async placeTargetsForLiveScripts(s = 'n') {


    let o=await this.getOrders(  );

    let o1=o.filter(o2=>o2.transaction_type=='SELL' && 
    o2.exchange=='NFO' && o2.status=='OPEN')
    .map(b=>b.tradingsymbol);
    
   //debugger;

    if (!this.instruments) {
        console.log('Point 9: Instruments not available');
        debugger;
        return;
    }

    console.log('Point 8: Before getRawPositions');
    await this.getRawPositions();

    this.instruAll = insAll;

    if (this.placingReverseOrderInProgress) {
        console.log('Point 7: Placing reverse order already in progress');
        return false;
    }

    this.placingReverseOrderInProgress = true;
    console.log('Point 6: Set placingReverseOrderInProgress to true');

    let livePositions = await this.getNFOPositions();
    let liveInstrumentSymbols = livePositions.map(position => parseInt(position.instrument_token));
   // let quotes = await this.getQuoteFromZerodha(liveInstrumentSymbols);

    let positions = livePositions.filter(p => p.quantity != 0);
    let positionIndex = positions.length - 1;
    let minuteData;

    console.log('Point 5: Starting position processing loop');
    while (positionIndex >= 0) {
        console.log('Point 4: Loop iteration - Positions left:', positionIndex + 1);

        let position = positions[positionIndex];
        positionIndex--;

        if (!position) {
            console.log('Point 2: No position found');
            this.placingReverseOrderInProgress = false;
            return false;
        }



  
        let cis = this.instruments.find(i => i.instrument_token == position.instrument_token) ||
                  this.instruAll.find(i => i.instrument_token == position.instrument_token);

        if (!cis) {
            console.log('Point 1a: CIS issue for instrument token', position.instrument_token);
            debugger;
            return;
        }
        console.log('Point 1: Retrieved position for instrument token', cis.tradingsymbol);


        if(o1.includes(cis.tradingsymbol)){
            console.log('HAS LIVE REVERSE BUY ORDER FOR ',cis.tradingsymbol);
           // this.placingReverseOrderInProgress = false;
           // debugger;
                        return;
                    }
        if (!cis.pricePoints) {
            let url = `/api/pricePoints/${position.instrument_token}/accessToken/${this.accessToken}`;
            try {
                let pp = await axios.get(url);
                cis.pricePoints = pp.data;
                console.log('Fetched price points from server for', cis.tradingsymbol);
            } catch (error) {
                console.log('Error fetching price points:', error);
              //  this.placingReverseOrderInProgress = false;
                return;
            }
        }

        let entryPrice = position.quantity < 0 ? position.sell_price : position.buy_price;
        let transaction_type = position.quantity > 0 ? "SELL" : "BUY";
        let targetPoint;

        if (!cis.minuteCandle || !Array.isArray(cis.minuteCandle.data) ) {
            let start = this.getRequiredTime(9, 15);
            let date = new Date();
            let end = this.getRequiredTime(date.getHours(), date.getMinutes() + 2);
            let symbol = cis.instrument_token;
            let intervel='minute';

           // let url = `/api/getHistoricalData/symbol/${symbol}/accessToken/${this.accessToken}/start/${start}/end/${end}/interval/minute`;
            let url = "/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+this.accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
            
            try {
                let resultPromise = await axios.get(url, {
                    headers: {
                      'Cache-Control': 'no-cache',
                      'Pragma': 'no-cache'
                    }
                  });
                let data = resultPromise.data;
                minuteData =data;

                let minuteCandle = {
                    data: data,
                    signal: this.getCandlestickSignal(data, cis.tradingsymbol)
                };
                cis.minuteCandle = minuteCandle;

                targetPoint = data[data.length - 1].high * 1.05;
                console.log('Fetched historical data and calculated targetPoint for', position.instrument_token);
            } catch (error) {
                console.log('Error fetching historical data:', error);
                this.placingReverseOrderInProgress = false;
                return;
            }
        } else {
            targetPoint = cis.minuteCandle.data[cis.minuteCandle.data.length - 1].high +5;
            console.log('Used existing minuteCandle data to calculate targetPoint for', position.instrument_token);
        }

        let livePnl = position.pnl;

        console.log('Reached before place target and stop loss for', position.instrument_token);
if(isNaN(targetPoint)){

    targetPoint=position.buy_price+5

    console.log('GETTING REVERSE PRICE FROM POSITIONS ')
   // debugger;
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

        console.log('Placed target and stop loss for', position.instrument_token);

        // Delay before the next iteration to prevent overlap
        await this.delay(3000); // 5000ms delay between each iteration
    }
    this.placingReverseOrderInProgress = false;
    console.log('End of placeTargetsForLiveScripts');
    this.placingReverseOrderInProgress = false;
}




,

      
  
  }
};
