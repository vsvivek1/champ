const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');
// let instru=require('./appv3/public/instruments/instrumentsForMining.json');
 let instru=require('./appv3/public/instruments/instrumentsForMiningWithOutCriteria.json');



let zero=require('./ZerodhaAPI');
let ohlc=require('./scraping/ohlc');





module.exports=

async function btst(){

    

    return new Promise(async (res,rej)=>{



   

  
       
  

    

    function today1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD')
    }
    let today=today1();;









// const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });

let access_token= await AccesTocken.findOne({ 'date': today },'access_token').
then(e=>e.access_token);

// console.log(access_token);

// let symbols=instru.map(i=>i.exchange+':'+i.tradingsymbol);
let symbols=instru.map(i=>i.instrument_token);

// let symbols=[23750658]

// let a= await zero.getClosingCandleData(access_token,symbols)
// let a= await zero.getHourlyCandleLows(access_token,symbols)

let start=0
let end=1000

let totalScript=[]
console.log('waiting a');



    

    
let t=await new Promise(async (res1,rej1)=>{




let timer=setInterval(async()=>{


    let symbol=symbols.slice(start,end)
console.log(symbol.length)

if(symbol.length==0){
   

    clearInterval(timer)
    // console.log(totalScript,'totalScript')
    // console.log(qualified,'qualified')
    res1(totalScript)

}
 
start=start+(end-start)
end=end+(end-start)

// console.log(symbol)

let ohl1= await ohlc(access_token,symbol);
if(typeof ohl1=='undefined'){

    return false
}
//   console.log(ohl1,'ohl')


let ohl= ohl1


let ar=[]


Object.keys(ohl).forEach(e=>{

    ar.push(ohl[e])

})

totalScript.push(...ar)




},333)

})









// console.log(totalScript,'ar')
let qualified=t.map(r=>{


    if(r.last_price<1){

        return false
    }

if(
    r.ohlc.open==0 ||
    r.ohlc.high==0 ||
    r.ohlc.low==0 ||
    r.ohlc.close==0
    
    
    ){

        return false
    }


    if(
        r.ohlc.open==
        r.ohlc.high==
        r.ohlc.low
        
        
        
        ){
    
            return false
        }

        if(
        r.ohlc.open==
        r.ohlc.high==
        r.ohlc.low
        
        
        
        ){
    
            return false
        }





 

        if(  
        
            (r.last_price-r.ohlc.low)*100/r.ohlc.low<1
            
            ){
    
                return false;
            }


    // && r.ohlc.close-r.ohlc.open==0
    if(r.last_price-r.ohlc.open==0  ){


        /// no change in price 
        return false;
    }

    let body=r.last_price-r.ohlc.open;

    let candleColor=(body>0) ?'green':'red';





let upperShadow;
let lowerShadow;
if(candleColor=='green'){
upperShadow=r.ohlc.high-r.last_price;
lowerShadow=r.ohlc.open-r.ohlc.low

}else{
upperShadow=r.ohlc.high-r.ohlc.open;
lowerShadow=r.last_price-r.ohlc.low;
 
}


if(candleColor=='green' && upperShadow*4 < body  ){

    // return r

    instru.filter(a=>a.instrument_token==r.instrument_token)[0].ohlc=r
return instru.filter(a=>a.instrument_token==r.instrument_token)[0]

}else{



    return false
}


}
).filter(a=>a!=false)



res(qualified)
// console.log()




})


}


// async function  main(){

//     let ma=await  btst();

//     console.log(ma,'bt')
   

// }


// main()












