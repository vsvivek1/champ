const timerMixin = {
    mounted() {
        console.log('hello from mixin!');
    },

    methods:{


        oneSecTimer (){ setInterval(() =>{ 

            var d  =  new Date();
             this.hours  =  d.getHours();
             this.minutes  =  d.getMinutes();
             this.seconds  =  d.getSeconds();
  
           if( this.seconds == 55 ){ 
  
            // this. getOneMinuteData()
  
  console.log(this.instrumentTokens);
            this.initiateHistoricalDataFetch(this.instrumentTokens);
            console.log( 'ohlc data at 53 sec',this.ohlcData, this.accessToken )
            }  
  
            } ,10000 )
    }
}};