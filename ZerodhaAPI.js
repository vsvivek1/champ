var KiteConnect = require("kiteconnect").KiteConnect;
// const accessToken = require('./models/AccessTokens');
const mongoose = require('mongoose');
const con = require('./MongoseConnect')
const api_secret=process.env.api_secret;
const api_key=process.env.api_key;
require('dotenv').config();
const Order=require('./models/Orders');
const FailedOrder=require('./models/FailedOrder');


class ZerodhaAPI {



    constructor() {
        const url = process.env.MONGO_URL + process.env.DB_NAME;
        const myDbName = process.env.DB_NAME;
        
        
        // mongoose.connect(url + myDbName, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true
        // });

        // this.access_token=access_token;


        // this.getAccessTocken();
    }



    static async NrInstruments(accessToken,range){
      var kc = new KiteConnect({
        api_key: api_key,


        access_token: accessToken
      });

      let instruments= await  kc.getInstruments(); 
      
      let eq=0;

    }  
    
    static async modifyOrder(accessToken,ordersString){   
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: accessToken
      }); 
if(ordersString.length==0){

  return false
}else{
  console.log('order string',typeof(ordersString))

}

      

      // return false;
     return  ordersString.map(async o=>{

      try {
        console.log('order string',o.variety,o.order_id,o.params);

        let modifiedOrderResult= await  kc.modifyOrder(o.variety, o.order_id, o.params) ;

        
        console.log('modifiedOrderResult',modifiedOrderResult)
        return modifiedOrderResult;
      } catch (error) {
        console.log('SOME ERROR',error)
      }

     

      })
          
   

    }
    
    
    static async GetLTP(accessToken,instruments){   
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: accessToken
      });     
      let ltps= await  kc.getLTP(instruments);       
    return ltps;

    }  
    
    static async getMargins(accessToken){   
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: accessToken
      });   
      
      console.log('getMargins(accessToken)',accessToken);
      let ltps= await  kc.getMargins();       
    return ltps;

    }

    static async getInstruments(accessToken){

      var kc = new KiteConnect({
        api_key: api_key,


        access_token: accessToken
      });

      let instruments= await  kc.getInstruments();



      let ins= instruments.filter(i=>{
        
      return  true;
      return   i.instrument_type='FUT' && i.name!='' && i.segment=='NSE'
        
      })

// console.log('ins',ins)
      let ln=ins.length;
      // let outer=ln/500;

      let ar=[]
      let outer=[];
      let i=ins.forEach((i,index)=>{


        let sym=i.segment+":"+i.tradingsymbol;
ar.push(sym);

if(index%500==0){
  let t
  kc.getQuote(t).then(r=>{

    if(r.oi!=0) {

      t=r;
    }
// console.log('qoute',t);

  })

  outer.push(ar);
  ar=[];


}



      })


      // console.log('outer',outer)
      return ins;
    };
    
static IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}



    static async PlaceBracketOrder(accessToken,ZerodhaParams,sessionString){
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: accessToken
      });


      let session={};

      let s=ZerodhaAPI .IsJsonString(sessionString)
      if(s){

        let session=JSON.parse(sessionString);
      }
      

      let arr=JSON.parse(arr1);
      arr.forEach(a=>{
        // let testObj=Object.keys(a).length === 0 && a.constructor === Object
        
        let a1={};
        if(JSON.stringify(a)!=JSON.stringify(a1))
        {
           
               kc.placeOrder(a.variety, a.params)
        
                   .then(order_id=>{
        
                    console.log('order_id',order_id.order_id)
        
        // let res=JSON.parse(order_id);
        let id=order_id.order_id
                    const order=new Order({
        
                      orderDetail:a,
                      order_id:id,
                      session:session
                    });
                  
                    order.save().then(r=>{
                  
                      // console.log('r',r)
                    }) .catch(e=>console.log('errror in saving order',e)) ;  
        
                    console.log(id)
                   }).catch((e)=>{
        
                    console.log('error',e)
                   })
        
                  }else{
        
                    console.log('empty')
                  }
        
                  })


    }

    static async PlaceTarget(accessToken,ZerodhaParams,sessionString){
       

      // console.log('essionString',sessionString);
      // return false;
      let session={};

      let s=ZerodhaAPI .IsJsonString(sessionString)
      if(s){

        let session=JSON.parse(sessionString);
      }
      
      

      
        var kc = new KiteConnect({
            api_key: api_key,
            access_token: accessToken
          });
        //   return ZerodhaParams;
          let arr=JSON.parse(ZerodhaParams);

          // console.log('this is a',arr);
let response=[];

let currentId=-1;
          arr.forEach(a=>{
// let testObj=Object.keys(a).length === 0 && a.constructor === Object

let a1={};
if(JSON.stringify(a)!=JSON.stringify(a1))//ch3cnking of null value of aa  was a workaround
{
   
       kc.placeOrder(a.variety, a.params)

           .then(order_id=>{

            // console.log('order_id',order_id.order_id)

// let res=JSON.parse(order_id);
let id=order_id.order_id

currentId=order_id.order_id;
            const order=new Order({

              orderDetail:a,
              order_id:id,
              session:session
            });

            if(currentId){

              let resObj={};
              resObj.orderDetail=a;
              resObj.order_id=currentId
              resObj.session=session;
              resObj.status='COMPLETED'
              resObj.error_msg='NO_ERROR'
              
              response.push(resObj)

            }

            
          
            order.save().then(r=>{
          
              // console.log('r',r)
            }) .catch(e=>console.log('errror in saving order',e)) ;  

            console.log(id)
           }).catch((e)=>{

            console.log('error',e)

            let resObj={};
            resObj.orderDetail=a;
            resObj.order_id=currentId;
            resObj.session=session;
            resObj.status='FAILED'
            resObj.error_msg=e;
            response.push(resObj)

            // console.log('error response', resObj);

            const FailedOrder1=new FailedOrder(resObj);
          
            FailedOrder1.save()

           }).catch(e=>console.log('errror in saving  failed order',e)) ; 

          

          }else{

            console.log('empty')
          }

          })





    }


    static async getOrders(accessToken){
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: accessToken
      });

      // return accessToken;
      // return accessToken;

      let out;
      let orders=await kc.getOrders().then(

res=>{
out=res;

}

      ).catch(e=>{

        out=e;
      });
      return out;
      
    }


    static async getPositions(accessToken){
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: accessToken
      });

      // return accessToken;
      // return accessToken;

      let out;
      let orders=await kc.getPositions().then(

res=>{
out=res;

}

      ).catch(e=>{

        out=e;
      });
      return out;
      
    }

    static async  getHoldingsFromZerodha (accessToken) {
        var kc = new KiteConnect({
          api_key: api_key,
          access_token: accessToken
        });
        let tmp;
        
        console.log('accessToken',accessToken)
      let holding = await  kc.getHoldings().then(res=>{
            
      tmp=res;
      
   
        }).catch(err=>{
      
      console.log('got an error',err)

      return err;
      
        });
      
      
        // let access_tocken=getAccessTocken(request_tocken);
        
      
        return tmp
        // .forEach(h=>h.selected=false);
      
      }
   
   
      static async  getQuoteFromZerodha (accessToken,aryOfInstruments) {

        return 1;
        var kc = new KiteConnect({
          api_key: api_key,
          access_token: accessToken
        });
        let tmp;
        
        console.log('accessToken',accessToken)
      let holding = await  kc.getQuote(aryOfInstruments).then(res=>{
            
      tmp=res;
      
   
        }).catch(err=>{
      
      console.log('got an error',err)
      
        });
      
      
        // let access_tocken=getAccessTocken(request_tocken);
        
      
        return tmp
        // .forEach(h=>h.selected=false);
      
      }


    static async generateSession(request_tocken) {

        var kc = new KiteConnect({
            api_key: api_key
        });
        
        if(request_tocken!=null){

            let access_token
          let session=await  kc.generateSession(request_tocken, api_secret);

          return session;
          

        }
       

    }

    getAccessTocken(request_tocken) {


        //check todays access toekn is stored in  mongo

        let today = new Date().toISOString().slice(0, 10);
        let qry = {};
        qry.date = today;
        accessToken.find(qry).then(r => {

                if (r.length == 0) {
                    //else get it and store it

                  

                }


                return getAccessTocken;

            }

           
        );
    return;

    // accessToken.deleteMany(qry).then(r=>console.log('r',r))
    // return;


    // const At=new accessToken();

    // console.log('at',At)
    accessToken.find(qry).then(r => {

        console.log(r)
    });
    return;

    accessToken.find(qry, res => console.log(res))
    return false;



    //return access token

    //initialize kc object using access token


    if (access_token == null) {

        kc.generateSession(request_tocken, api_secret)
            .then(function (response) {



                access_token = response.access_token;


                console.log('Success in getting access tocken', access_token)
            })
            .catch(function (err) {
                console.log('Getting request Tocken Failed', err);
            });

    }


    return getAccessTocken;
}



}

let a = new ZerodhaAPI('123');

module.exports = ZerodhaAPI;