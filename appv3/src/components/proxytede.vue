if(this.proxyTrade==true){

 let a= this.proxyTradeExitProcedure(CurrentInstrument)
// console.log('here',a)



if(this.proxyPositions.length>0){

  let a1=this.proxyPositions[0].squaredOff
let a2=this.proxyPositions[0].instrument.instrument_token

// console.log(a1,a2,'a12')

}






  let pp1=this.proxyPositions.filter(k=>{
return k.squaredOff==false &&
k.instrument.instrument_token==CurrentInstrument.instrument_token 
});

if(pp1.length>0){



  // console.log('last price setting ',last_price)
  this.proxyPositions.filter(pp=>{ 
    return pp.squaredOff==false &&
pp.instrument.instrument_token==CurrentInstrument.instrument_token 
})[0].last_price=last_price




// console.log('alreeady bought')

  return 
}


if(CurrentInstrument.previousPrice==0){

  // console.log('pvs price zero');
}

if(
  CurrentInstrument.previousPrice<CurrentInstrument.pricePoints.d2.high &&
last_price>=CurrentInstrument.pricePoints.d2.high
)
{




let ob={};
ob.instrument=CurrentInstrument;
ob.entryType="buy";
ob.entryPrice=CurrentInstrument.pricePoints.d2.high;
ob.squaredOff=false;
ob.exitPrice=0;
ob.exitType='NOT EXITED';
ob.last_price=0;
ob.profit=0;

this.proxyPositions.push(ob);
// console.log('traded')
}else{


  // console.log('not traded')
}




return ;

}

