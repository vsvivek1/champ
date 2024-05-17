export default{ 

    methods:{ 

        buildOrderArray( 
          iceberg_legs=0,
            iceberg_quantity=0, 
            tradingsymbol,
            transaction_type,
            qty,
            order_type,
            Price,
            product  =  "NRML",reverseOrder
           ) { 
      
      this.cl( 'build order array' )
      
      // this.cl( reverseOrder,'reverseOrder from build arrya ' )
      
      if( reverseOrder == false ){ 
      //for diableing entry
        //return;
       } 
      
      
      if( reverseOrder == true ){ 
      
        let PlacedReverseOrder = this.instruments.filter( 
                    ( i )  => i.tradingsymbol  ==  tradingsymbol
                   )[0].PlacedReverseOrder
      
                  if( PlacedReverseOrder == true ){ 
      
                    return false;
                   } 
      
       } 
       
      
            let order  =  {  } ;
            let proposedStock;
      
      
           
      
            //   proposedStock  =  this.instruments.filter( 
            //     ( i )  => i.tradingsymbol  ==  tradingsymbol
            //    )[0].name;
      
            
            //  } 
      
            //   order.variety  =  this.selectedVariety;
      
          /*   proposedStock  =  this.instruments.filter( 
              ( i )  => i.tradingsymbol  ==  tradingsymbol
             )[0].name; */
      
           // this.liveOrderPlacedScripts.push( proposedStock );
      
            // this.cl( 'hrs, min',this.hours,this.minutes )
            let exchange  =  this.itype;
      
            if ( exchange !=  this.itype ) { 
              if ( 
                ( this.hours  ==  15 && this.minutes > 30 ) ||
                this.hours > 15 ||
                this.hours < 9 ||
                ( this.hours  ==  9 && this.minutes < 15 )
               ) { 
      
      
                order.variety  =  "amo";
      
                console.log( order.variety,'ov' )
               }  
              
              else { 
                order.variety  =  "regular";
               } 
      
      
             }  else if ( exchange  ==  this.itype ) { 
              if ( 
                ( this.hours  ==  23 && this.minutes >=  30 ) ||
                this.hours  ==  0 ||
                this.hours < 9 ||
                ( this.hours  ==  9 && this.minutes < 15 )
               ) { 
                order.variety  =  "amo";
               }  else { 
                order.variety  =  "regular";
               } 
             } 
      
            //  order.variety  =  "regular";
      
      this.cl( this.hours,'hours' );
      
            if(( this.hours>15 || ( this.hours == 15 && this.minutes>35 )) ){ 
      
              order.variety  =  "amo";
      
              this.cl( 'amo' )
      
      
              if( transaction_type == 'BUY' && !reverseOrder ){ 
      
      order.variety  =  "regular";// prevent buy amos 
       } else{ 
      
      order.variety  =  "AMO";// prevent buy am
      
       } 
      
             } 
      
      
            if( this.hours>9 || ( this.hours == 9 && this.minutes>15 )){ 
      
              order.variety  =  "regular";
      
             } 
      
      
             if (this.isAfterMarketHours()) {
              order.variety  =  "amo";
              console.log("Action should be executed.");
            } else {
              order.variety  =  "regular";
            }
           
            order.variety  =  "regular";
            order.params  =  {} ;
            order.params.exchange  =  this.itype;
            order.params.tradingsymbol  =  tradingsymbol;
            order.params.transaction_type  =  transaction_type;
      
            order.params.quantity  =  qty;
      
            order.params.product  =  product;
            order.params.order_type  =  order_type;
           
           
            order.params.validity  =  "DAY";

             order.params.iceberg_legs=iceberg_legs,
            order.params.iceberg_quantity=iceberg_quantity, 
      
            order.params.price  =  Price;
      
      
      
            if( reverseOrder == true ){ 
              this.$set( 
                  this.instruments.filter( 
                    ( i )  => i.tradingsymbol  ==  tradingsymbol
                   )[0],
                  "PlacedReverseOrder",
                  true
                 );
      
                
      
             } 
             
      
            return order;
           }

    }}