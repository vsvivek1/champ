import axios from 'axios'
export default{
   
  



        computed:{

      target(){


let s=this.prices[this.CurrentLevelIndex];
let t=this.prices[this.CurrentLevelIndex+1];

let toc={};
toc.instrument_tocken=this.instrument_tocken;


let l={};
l.support=s;
l.ressistance=t;

toc.level=l;

return toc;

      },  
      
  levels(){
return this.prices.map(p=>p.level)

  }  ,

prices(){

this.pricePoints.forEach((p,index)=>{

    if(p.level<this.ltp  && this.pricePoints[index+1]['level']>this.ltp){

p.Currentlevel=true;

this.CurrentLevelIndex=index;
    }else{
        p.Currentlevel=false;
    }
})

return this.pricePoints;
return JSON.parse(this.pricePoints)

}
        },
  
        data(){
            return{

                value: [
        423,
        446,
        675,
        510,
        590,
        610,
        760,
      ],
pricePoints:[],
CurrentLevelIndex:-1,

            }
        },
       
        props:['instrument_tocken','ltp'],
        methods:{
getPricePoints(instrument_tocken){
let timeout=500;
   


    console.log('this is from support resistance');
const url = '/api/pricePoints/'+instrument_tocken;


//for api rate limit 
setTimeout(() => {
    axios.get(url).then(res=>{
        this.pricePoints=res.data
        
        })
}, timeout);




}

        }
    }

