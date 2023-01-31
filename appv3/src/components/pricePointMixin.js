import store from '@/store';
import axios from 'axios';
export default{
    methods:{
       async getQuoteFromZerodha(accessToken,arryOfInstruments){ 
            const url ="/api/getQuoteFromZerodha";
            return;
let params={};
params.accessToken=accessToken;
params.arryOfInstruments=arryOfInstruments;

         await   axios.post(url,params).then(res=>{

                console.log(res)
            })

        },
        


        getPricePoints(inst_token=this.instrument_tocken,
            acces_token=this.accessToken,average_price){
            // let inst_token1=1207553;

            const url = '/api/pricePoints/'+inst_token+'/accessToken/'+acces_token;


            let timeout=333;
            setTimeout(() => {

                // console.log('price fired  ')
                axios.get(url).then(res=>{
                    this.pricePoints=res.data.pricePoints;


                    this.pivotPoints=res.data.pivotPoints;//json

                    this.heikinAshi=res.data.heikinAshi;


                    this.pivotPointObject=res.data.pivotPointObject;
                    this.yesterday=res.data.yesterday;

console.log(average_price,'average_price');


                    // console.log('price point from mixin',this.pricePoints);
                    
                    })
            }, timeout);


            
        
            
            }
    },

    mounted(){
console.clear()

    },

    data(){

        return{
            heikinAshi:{},
pivotPoints:'',
yesterday:'',
pivotPointsJson:'',
pivotPointObject:{}

        }
    },
computed:{
    target(){



        let ln=this.prices.length;
        // console.log('fro target','ln',ln,'this.CurrentLevelIndex',this.CurrentLevelIndex)
        
        var s;
        if(this.CurrentLevelIndex<ln){
        
        if(typeof this.prices[this.CurrentLevelIndex] === 'undefined'){

            // console.log('undefined so ',this.prices,'current index',this.CurrentLevelIndex)
        s=-1;
        }else{
        s=this.prices[this.CurrentLevelIndex];
        
        }
        
        
        var t;
        
        if(typeof this.prices[this.CurrentLevelIndex+1] === 'undefined'){
        
            
         t='999999999';
        
        //  console.log('undefiend',t)
        
        
        
        }else{
        
             t=this.prices[this.CurrentLevelIndex+1];
        }
        
        // console.log('t',t)
        
        
        let toc={};
        toc.instrument_tocken=this.instrument_tocken;
        
        
        let l={};
        l.support=s;
        l.ressistance=t;
        
        toc.level=l;



        if(typeof(this.yesterday)=='undefined'){

       
            return false;
        }else{

            toc.yesterday=this.yesterday;
            let yesterdayHigh5pc=this.yesterday.high*1.02;
            toc.quote=this.yesterday.qoute;


            let pricePointAbove5pcYesterdayHigh= 
            this.prices.filter(p=>p.high>yesterdayHigh5pc);
            toc.yesterdayHigh5pc=yesterdayHigh5pc;



                                     //////////////////////////////

                                                                    if(pricePointAbove5pcYesterdayHigh.length>0)
                                if(toc.quote.upper_circuit_limit>pricePointAbove5pcYesterdayHigh[0].high)

                                {


                                    
                                toc.realtarget=pricePointAbove5pcYesterdayHigh[0].high
                                toc.realtargetType='pricePointAbove5pcYesterdayHigh'
                                        

                                }


                                else
                                if(toc.quote.upper_circuit_limit>this.yesterday.rangeBreakOutTarget)
                                {
                                    toc.realtarget=this.yesterday.rangeBreakOutTarget

                                    toc.realtargetType='rangeBreakOutTarget'

                                }

                                if(typeof(toc.realtarget)=='undefined')
                                if(toc.quote.upper_circuit_limit>this.yesterday.rangeBreakOutTarget)
                                {

                                    toc.realtarget=this.yesterday.rangeBreakOutTarget

                                    toc.realtargetType='rangeBreakOutTarget'
                                }
                                     //////////////////////////////
      
      
      
      
      
        }
        

        toc.pivotPoints=this.pivotPoints;

        toc.heikinAshi=this.heikinAshi;
        

        toc.pivotPointObject=this.pivotPointObject;




        

    


   
        // toc.pivotPoints=this.pivotPoints;

//       

        

toc.prices=this.prices;




// console.log('toc.pivotPoints-type',typeof(pivotPointObject ),'this.pivotPoints r1',toc.pivotPoints.r1,'upr ckrt limit',toc.quote.upper_circuit_limit)

// console.log('toc.quote',toc.quote)








if(typeof(toc.realtarget)=='undefined')
if(toc.quote.upper_circuit_limit>toc.pivotPointObject.r3)
if(toc.pivotPoints!='hi')
{

    toc.realtarget=toc.pivotPointObject.r3

    toc.realtargetType='toc.pivotPoints.r3'
}

if(typeof(toc.realtarget)=='undefined')
if(toc.pivotPoints!='hi')
if(toc.quote.upper_circuit_limit>toc.pivotPointObject.r2)
{

    toc.realtarget=toc.pivotPointObject.r2

    toc.realtargetType='toc.pivotPoints.r2'
}
if(typeof(toc.realtarget)=='undefined')
if(toc.pivotPoints!='hi')


if(toc.quote.upper_circuit_limit>toc.pivotPointObject.r1)
{


    toc.realtarget=toc.quote.upper_circuit_limit;
    // toc.realtarget=toc.pivotPointObject.r1

    toc.realtargetType='toc.pivotPoints.r1'
}



// if(toc.realtarget!=""){

//     toc.realtarget=this.yesterday.ranageBreakOutTarget;
// }




// toc.pricePointAbove5pcYesterdayHigh=pricePointAbove5pcYesterdayHigh;



        
        return toc;
        
        }else{
        let toc={};
        toc.instrument_tocken=this.instrument_tocken;
        
            let l={};
        l.support=-1;
        l.ressistance=-1;
        
        toc.level=l;

        return toc;
        }
        
        
              },  
              
          levels(){
        return this.prices.map(p=>p.level)
        
          }  ,
        
        prices(){

            
        
        this.pricePoints.forEach((p,index,arry)=>{
            
            let ln=arry.length;

            // console.log('index',index,'this.pricePoints',this.pricePoints,'len',ln)
        
      
        if(index+1<ln){
        
            if(p.level<this.ltp  && this.pricePoints[index+1]['level']>this.ltp){
        
        p.Currentlevel=true;
        
        this.CurrentLevelIndex=index;
            }else{
                p.Currentlevel=false;
            }
        
        }
           
        })
        
        return this.pricePoints;
        return JSON.parse(this.pricePoints)
        
        }

}

}