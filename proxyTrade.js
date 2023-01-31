module.exports=function proxyTrade(io){

    return 
  
  
    const ticks=require('./appv3/public/instruments/ticks.json');
    const instruments=require('./appv3/public/instruments/instrumentsForMining.json');
    var makeTick=require('./backtest/tickGenerator');
    let outer=setInterval(() => {
  
      let p=ticks.pop();
  
  
      if(typeof p=='undefined'){
  
          clearInterval(outer)
      return ;
      
      }
      let symbol=Object.keys(p)[0]
  
  
      let ar=p[symbol];
  
  
    
  let inner=setInterval(()=>{
  
     
  let tick1=ar.pop();
  
  if(typeof tick1=='undefined'){
  
      clearInterval(inner)
  return ;
  
  }
  
  let t=makeTick(tick1,symbol)
    //  console.log({t})
  
   
  io.emit('send-realtime-subscription',t)
  
  },100)
  
  
      
  }, 1*400);
   
   
   
    }
  