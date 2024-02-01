export default function PlaceGttOrderForThisPrice( stockPpItem,level,accessToken){ 

    console.log( stockPpItem,level );
    
    let ob = {  } ;
    
    ob.params = {  } ;
    
    ob.accessToken = accessToken;
    
    ob.params.tradingsymbol = stockPpItem.tradingsymbol;
    ob.params.exchange = stockPpItem.exchange;
    ob.params.trigger_values = [level];
    ob.params.last_price = stockPpItem.last_price;
    
    
    
    console.log( JSON.stringify( ob.params ),'ob params' );
    let order = {  } ;
    order.transaction_type = 'BUY'
    order.quantity = ( this.gttAmountPerManualOrder/level ).toFixed( 0 )
    order.product = 'CNC'
    order.order_type = 'LIMIT'
    order.price = level;
    
    ob.params.orders = [order]
    
    let url = "/api/PlaceGTT";
    axios.post( url,ob ).then( r =>console.log( r,'response' ))
    
    
     }