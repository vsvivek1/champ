export default{



    methods:{


        async   trailingStopLossWithLtp(){ 

      

            this.cl( 'Trailing Stop Loss FROM TRAILING STOP LOSS' )
              await this.getOrders();
              await this.getPositions();
        
        
        let validOrders = this.allOrders.filter( lo =>
        { 
        
          let st = ( lo.status == 'COMPLETE' ||
        lo.status == 'REJECTED' ||
        lo.status == 'CANCELLED' ||
        lo.status == 'CANCEL PENDING' 
         )
        
        st = lo.status == 'OPEN';
        
        return st;
        
         } 
        
        
        
        
         )
        
        
        this.cl( 'Trailing Stop Loss FROM TRAILING STOP LOSS validOrders',validOrders.length )
        
        
        const count  =  this.livePositions.filter( pos  => pos.pnl > 1000 ).length;
        console.log( `From trailing stop loss Number of positions with PnL greater than 2000: ${ count } ` );
        
        this.newOrder  = 
        
          
          
          validOrders.filter( o => o.transaction_type == "SELL" ).map( i =>{ 
        
        
        
        
        
        let lp  = this.livePositions.find( j =>j.instrument_token == i.instrument_token )
        let cis = this.instruments.find( k =>k.instrument_token == i.instrument_token );
        
        this.cl( 'Trailing Stop Loss 1' )
        if( typeof lp ==  'undefined' || typeof cis == 'undefined' ){ 
        
          // this.cl( 'Trailing Stop Loss INSTRUMENT NOT FOUND IN VALID POSTIONS WTF ',cis.tradingsymbol );
        
          return ;
         } 
        
        this.cl( 'Trailing Stop Loss 2' )
        
        
        if( lp.pnl<500 || cis.last_price == 0 ){ 
        
        
          this.cl( 'either pnl less than 1000 or last pri e 0',lp.pnl,cis.last_price )
          return ;
         } 
        
        
        let proposedStopLoss;
        
        let currentSellOrderPrice = i.price;
        
        if( i.status == 'TRIGGER PENDING' ){ 
        
        
          console.log( 'has current triger' )
        
        // already have stop loss
        
        /// modify if new proposed stop loss is greater than current one
        proposedStopLoss = cis.last_price*.9;
        
        if( i.price< proposedStopLoss*.95 ){ 
        
          // console.log( 'proposed sgoploss is TSL',proposedSopLossPrice )
          let o={};
            o.variety = 'regular';
            o.order_id = i.order_id;
            let params = {  } ;
              params.price = proposedSopLossPrice.toFixed( 1 )
        
        params.trigger_price = proposedSopLossPrice.toFixed( 1 )
        params.order_type = "SL"
            o.params = params;
        
        
            this.cl( 'PLACING STOP LOSS FOR GAIN  ', )
        
            // console.log( lp.tradingsymbol,lp.pnl,o )
          
            return o;
        
         } 
        
         return;
         } else{ 
        
        
        
          console.log( 'NO current triger' )
        
        /// no trigger
        let o={};
        
        let proposedSopLossPrice = cis.last_price*.9
        o.variety = 'regular';
            o.order_id = i.order_id;
            let params = {  } ;
              params.price = proposedSopLossPrice.toFixed( 1 )
        
        params.trigger_price = proposedSopLossPrice.toFixed( 1 )
        params.order_type = "SL"
            o.params = params;
        
        
            this.cl( 'PLACING STOP LOSS FOR GAIN  ', )
        
            // console.log( lp.tradingsymbol,lp.pnl,o )
          
            return o;
        
        
        
         } 
        
        
        
        
        
        
        
                   }  ).filter( i =>i!= null );
        
                  let t  =  await this.getOrders();
        
        this. cl( 'Bumber of new orders :',this.newOrder.length,this.newOrder )
        
        
        this.updateOrder();
                 } ,
    }
}