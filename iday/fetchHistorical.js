function fetchHistorical(){
    if(instrumentsAboveOpen && instrumentsAboveOpen.length>0){
    setInterval(async ()=>{
    
    orders=await kite.getOrders();
    nfoOrders=orders.filter(i=>i.exchange=='NFO')
    openNFOorders=orders.filter(s=>s.status=='OPEN')
    openNFOBUYorders=nfoOrders.filter(s=>s.transaction_type=='BUY')
    openNFOSELLorders=nfoOrders.filter(s=>s.transaction_type=='SELL')
    let p=await kite.getPositions();
    
    netPositions=p.net;
    dayPositions=p.day;
    positions=p;
    
    //console.log(p)
    
    
    
        for(var i=0;i<instrumentsAboveOpen.length;i++){
    
            setTimeout(()=>{
        
                console.log('gistory to be fetched foer',instrumentsAboveOpen[i])
                kite.getHistoricalData()
            },500)
       
    }
    
    
    //console.log(orders,'orders')
    
    },1000
    
    
    
    
    ); 
    }
    }
    