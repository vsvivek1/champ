export default{

    computed: { 

        totalOptionPrice() { 
        let positionTotal  =  -1;
        let orderTotal  =  -1;
    
        if ( this.livePositions && this.livePositions.length > 0 ) { 
          positionTotal  =  this.livePositions
          
          // .filter( lp =>lp.instrument.segment == 'NFO-OPT' )
          
          .
          
          reduce(( total, position )  => { 
            const {  buy_price, price, quantity  }   =  position;
            total+= ( buy_price ) * quantity;
            return total;
           } , 0 );
         } 
    
        if ( this.liveOrders && this.liveOrders.length > 0 ) { 
          orderTotal  =  this.liveOrders.filter( lo =>
          
          // !lo.tradingsymbol.includes( 'FUT' ) && 
          
          lo.transaction_type == 'BUY' ).
          
          reduce(( total, order )  => { 
            const {  buy_price, price, quantity  }   =  order;
            total+= (  price ) * quantity;
            return total;
           } , 0 );
         } 
    
        return positionTotal + orderTotal;
       } ,
    
    
        logFileUrl() { 
        if ( this.logs.length ) { 
          const allLogs  =  this.logs.join( '\n' );
          const blob  =  new Blob( [allLogs], {  type: 'text/plain'  }  );
          return URL.createObjectURL( blob );
         } 
        return null;
       } ,
    
        rows() { 
          return this.executedTrades.map(( trade )  => { 
            return { 
              tradingsymbol: trade.tradingsymbol,
              buyPrice: trade.buyPrice,
              buyTime: trade.buyTime,
              sellPrice: trade.sellPrice,
              sellTime: trade.sellTime,
              profit: trade.profit,
             } ;
           }  );
         } ,
    
        indices(){ 
    
          return this.instruments.filter( i =>i.segment == 'INDICES' )
    
         } ,
    
        proxyPositions1(){ 
    
    return this.proxyPositions.sort(( a,b ) =>{ 
    
     return  b.profit-a.profit
    
     }  )
    
         } ,
    
        livePositionsDisplay(){ 
    return this.livePositions.filter( lp =>typeof lp.instrument!= 'undefined' )
    
         } ,
        instrumentsDisplay() { 
          return this.instruments.filter( i =>typeof i.pricePoints!= 'undefined' )
          
          // .filter( 
          //   ( i )  => i.last_price !=  0 && i.pricePoints.d1.range !=  0
          //  );
         } ,
    
        executedBuyOrdersTime() { 
          return this.executedOrders
            .filter(( r1 )  => r1.transaction_type  ==  "BUY" )
            .map(( r )  => { 
              let {  instrument_token, exchange_update_timestamp  }   =  r;
    
              return {  instrument_token, exchange_update_timestamp  } ;
             }  );
         } ,
        closedTradesScriptsPnl() { 
          if ( this.closedTradesScripts.length > 0 ) { 
            return this.closedTradesScripts.reduce(( pvs, cur )  => { 
              return pvs + cur.pnl;
             } , 0 );
           }else return 0;
    
         } ,
    
        totalpnl() { 
    if( typeof this.livePositions  == 'undefined'  ){ 
    
      return 0;
     } 
    
          if ( this.livePositions.length  ==  0 ) { 
            return 0;
           } 
          return this.livePositions.reduce(( pvs, cur )  => { 
            return pvs + cur.pnl;
           } , 0 );
         } ,
        liveTradablebalance() { 
          return ( 
            this.maxTradableAmount -
            this.liveBuyOrderAmount -
            this.livePositionTotalCost -
            this.totalBuyOrderLivePlacedBySoftware -
            this.proposedBuyAmount
           );
         } ,
        //  &&  typeof i.SevenDayMaxMin!= 'undefined'
    
        // &&  typeof i.SevenDayMaxMin!= 'undefined'
        totalLiveprofitIfExecuted() { 
          return 0;
    
          let total  =  0;
    
          this.instruments
            .map(( i )  => i.liveprofitIfExecuted )
            .forEach(( e )  => { 
              // this.cl( 'e',e )
    
              if ( isNaN( e )) { 
                e  =  0;
               } 
    
              total  =  total + e;
             }  );
    
          return total;
    
          return this.instruments
            .map(( i )  => i.liveprofitIfExecuted )
            .reduce(( c, p )  => { 
              if ( isNaN( p )) { 
                p  =  0;
               } 
              c  =  c + p;
             } , 0 );
         } ,
    
        instrumentsFiltered() { 
          return this.instruments.filter(( i )  => i.enterNowToTrade  ==  true );
    
          // .sort(( a, b )  => { 
          //   return a.activatedTime - b.activatedTime;
          //  }  );
         } ,
       } ,
}