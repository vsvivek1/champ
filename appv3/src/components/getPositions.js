import vue from 'vue';
import axios from 'axios'

export default{

    methods:{
        async getPositions() { 
          let url  =  "/api/getPositions";
let obj={}
            // call after get live orders
      
            if( this.hasStartedGetLivePosition == true ){ 
              this.cl( 'FROM GET POSITION FOR HEALTH, STARTED FETCHING LIVE POS' )
              return false
             } 
            this.hasStartedGetLivePositions = true;
           
            
            obj.accessToken  =  this.accessToken;
            return axios.post( url, obj ).then( async ( res )  => { 
      
      
              this.hasStartedGetLivePositions = false;
        
              if ( typeof res.data.net  ==  "undefined" ) return [];
      
             
              if ( res.data.net.length > 0 ) { 
                        this.setLivePositionScripts( res.data.net ) 
                 
                 } 

                 
              let tmp;
              let livePositionsTmp  = res.data;
      
            
      
              this.allPositions = res.data.net;
      
              // console.log( 'this.all pos',this.allPositions )
              if ( typeof livePositionsTmp  ==  "undefined" ) { 
                this.livePositions  =  "NOT_LOADED";
      
                this.livePositionTotalCost  =  -1;
                // this.cl( 'here one 6' )
                return []
                // return false;
               } 
              if ( typeof livePositionsTmp.net  ==  "undefined" ) { 
                this.livePositions  =  [];
      
                this.livePositionTotalCost  =  -1;
                return true;
               } 
      
              tmp  =  livePositionsTmp.net
                    .filter( 
                      ( p )  =>
                        p.exchange  ==  this.itype &&
                        // p.tradingsymbol.includes( "FUT" ) &&
                        p.quantity !=  0
                     )
                    .sort(( a, b )  => b.pnl - a.pnl );
      
               
      
              if ( livePositionsTmp.net.length  ==  0 ) { 
                  tmp  =  [];
      
                  this.livePositionTotalCost  =  -2;
                  // this.cl( 'here one 7' )
                  return  tmp;
                 } 
      
      
                let liveInstrumentSymbols  =  livePositionsTmp.net.map( 
                    ( a )  => a.instrument_token
                   ); 
                  
                this.liveInstrumentSymbols  =  liveInstrumentSymbols
      
      
                  var quotes  =  await this.getQuoteFromZerodha( liveInstrumentSymbols );
           
                  tmp.forEach(( e )  => { 
                    let instrument  =  this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  e.instrument_token
                     )[0];
      
                    // this.cl( 'e.instrument_token',e.instrument_token )
      
                    let q  =  quotes[e.instrument_token];
      
                    // this.cl( q,'q' )
      
                    this.$set( e, "instrument", instrument );
                    this.$set( e, "quotes", q );
      
      
                  
                   }  );
      
                  
      
      
      
                 
      
                  this.setClosedTradesScripts( livePositionsTmp.net )
                  
                 
                 
                 
                  this.livePositions  =  tmp;
      
                  this.livePositionTotalCost  =  0;
      
      this.totalBuyOrderLivePlacedBySoftware  =  0;
      this.livePositions
      
        .filter(( f )  => f.exchange  ==  this.itype 
        // && f.tradingsymbol.includes( "FUT" )
         )
        .forEach( async ( l )  => { 
      
      
          this.livePositionTotalCost  =  Math.abs( 
            this.livePositionTotalCost + l.average_price * l.quantity
           );
      
          if ( 
            typeof this.instruments.filter( 
              ( i )  => i.instrument_token  ==  l.instrument_token
             )[0] !==  "undefined"
           ) { 
            this.$set( 
              this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               )[0],
              "average_price",
              l.average_price
             );
      
      
            this.$set( 
              this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               )[0],
              "hasLivePosition",
              true
             );
      
      
      
           } else{ 
      
      
            if( this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               ).length!= 0 ){ 
      
                this.$set( 
              this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               )[0],
              "hasLivePosition",
              false
             );
               } 
          
      
           } 
      
          this.$set( l, "targetPc", 1.2 );
      
          try { 
      
            if( this.instruments.filter( 
              ( i )  => i.instrument_token  ==  l.instrument_token
             ).length!= 0 ){ 
              let rangeBreakOutTarget  =  this.instruments.filter( 
              ( i )  => i.instrument_token  ==  l.instrument_token
             )[0].pricePoints.d1.rangeBreakOutTarget;
      
            
            this.$set( l, "rangeBreakOutTarget", rangeBreakOutTarget );
      
      
             } 
      
      
         
            // let t = await this.getOrders();
      
      
      let transaction_type;
      
      if( l.quantity>0 ){ 
        transaction_type = "SELL"
      
       } 
      if( l.quantity<0 ){ 
      
        transaction_type = "BUY"
       } 
      
            let ln  =  this.orders
              .filter(( o )  => 
              
              o.tradingsymbol  ==  l.tradingsymbol && 
              o.quantity ==  Math.abs( l.quantity )
              
              && o.transaction_type == transaction_type
              
               )
            .length;
      
      
      // this.cl( l.quantity,'tt',transaction_type,'ln',ln,this.orders )
      
      
              // this.cl( { ln }  )
      
              
           
      
      if(    this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  l.instrument_token
                 ).length!= 0 ){ 
      
                
      
            if ( ln  ==  0 ) { 
      
      
              
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  l.instrument_token
                 )[0],
                "hasLiveTarget",
                false
               );
             }  else if ( ln > 0 ) { 
      
      
      
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  l.instrument_token
                 )[0],
                "hasLiveTarget",
                true
               );
      
              this.$set( l, "hasLiveTarget", true );
      
      
              if( this.orders
              .filter(( o )  => o.tradingsymbol  ==  l.tradingsymbol )
             .length!= 0 ){ 
      
              let targetPrice  =  this.orders
              .filter(( o )  => o.tradingsymbol  ==  l.tradingsymbol )
             [0].price
      
             this.$set( l, "targetPrice", targetPrice );
              } 
      
            
      
           
      
              let element  =  quotes[l.instrument_token];
      
                
      
              
             } 
      
           }  else{ 
      
            // this.cl( 'has live target canoot be updated in intruments .. update instrument with the script' )
           } 
      
            this.hasStartedGetLivePositions = false
           }  catch ( error ) { 
            this.cl( 'here one 9',error )
            this.$set( l, "rangeBreakOutTarget", 9999 );
            this.$set( l, "hasLiveTarget", false );
      
            this.hasStartedGetLivePositions = false;
           } 
      
          // this.$set( l, "target", Math.ceil( l.average_price * l.targetPc ), 1 );
      
          // no live target so set a live target
      
          if ( 
            typeof this.instruments.filter( 
              ( i )  => i.instrument_token  ==  l.instrument_token
             )[0]  ==  "undefined"
           ) { 
      
            let tmp = JSON.stringify( l.instrument_token )
            let k = await this.updateMissingScriptInInstrumetsFile( tmp );
      
            this.cl( 
              "l.instrument_token absent",
              l.tradingsymbol,
              l.instrument_token
             );
            this.hasStartedGetLivePositions = false;
            return false;
           } 
         }  );
      
      
        this.hasStartedGetLivePositions = false;
              
        
        return this.livePositions;
      
      
      
           
      
        
             }  );
          
          
           } ,


    }


}