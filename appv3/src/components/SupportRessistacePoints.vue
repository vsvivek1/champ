<template>
    <div>



        


   <!-- <svg height="200" width="500">
  <polyline :points="levels"
  
   style="fill:none;stroke:black;stroke-width:3" />
  Sorry, your browser does not support inline SVG.
</svg> -->


<!-- <ul class=" list-group list-group-horizontal"> -->

<input type="range" name="" id="" list="priceList" :Value="curPrice">

<datalist id="priceList">

    <option v-for="(price,index) in prices" :key="index" :value="price">
    </option>
</datalist>
price.Currentlevel {{curPrice}}


<select name="" id="" class="form-control">
   
     <option v-for="(price,index) in prices" :key="index" :value="price"> {{price}}
    </option>
</select>

<!-- <b @click="emmitSelectedPrice(price.level)">{{price.level}}</b> -->

<!-- <ul >
    <li @click="emmitSelectedPrice(price.level)" style="display:inline;" class="list-group-item3"
     v-for="(price,index) in prices" :key="index">
{{price.level}}
 


<span v-if="price.Currentlevel" class="text-success">
    LTP {{ltp}}
</span>



    </li>
</ul> -->

<!-- instrument_tocken {{instrument_tocken}} -->

    
    </div>
</template>

<script>

// import SupportRessistacePoints from './SupportRessistacePoints.vue';
import axios from 'axios';
 import store from '@/store';
 import pricePointMixin from './pricePointMixin'
    export default {

        mixins:[pricePointMixin],


updated(){


if(typeof this.target !='object'){
this.$emit('calculated',{})

}else{

this.$emit('calculated',this.target)
}




},
        computed:{

               session:{
get(){

    return store.state.session;
},
set(val){

    store.commit('setSession',val)
}

            },
            accessToken:{
get(){

    return store.state.accessToken;
},
set(val){

    store.commit('setAccessToken',val)
}

            },

      
        },
        mounted(){

            setTimeout(()=>{
this.getPricePoints();

let instru='NSE:'+this.instrument_tocken;
let arryOfInstruments=[]
arryOfInstruments.push(instru);


this.getQuoteFromZerodha(this.accessToken,arryOfInstruments)

            },200)


        },
        data(){
            return{
                
                clickedPrice:-1,
                curPrice:-1,

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
        name:'SupportRessistacePoints',
        props:['instrument_tocken','ltp'],
        methods:{


emmitSelectedPrice(price){

   this.clickedPrice=price;
// this.$emit('calculated',price);

this.ltp;

if(price>this.ltp){

let toc={};
toc.instrument_tocken=this.instrument_tocken;


let l={};

l.ressistance=price;


//find point below price 

// let ob=this.pricePoints.filter(p=>p.)

// console.log(this.pricePoints); 
this.pricePoints.forEach((p,index)=>{

    if(p.level==this.clickedPrice){

        console.log('p',p)
this.CurrentLevelIndex=index;
        return false;
    }
})

// var index = this.pricePoints.findIndex(function(price) {
//   return price.level == this.clickedPrice
// });

let ln=this.pricePoints.length;
console.log('index',this.CurrentLevelIndex,'ln=',ln)

let indexBelowThePrice=this.CurrentLevelIndexindex-1;

// let SupportPrice=this.pricePoints[indexBelowThePrice]['level'];

console.log('indexBelowThePrice',this.CurrentLevelIndexindex)
let SupportPrice=this.pricePoints[10]['level'];

l.support=SupportPrice;

toc.level=l;


console.log('toc',toc)


// return toc;

//asume change in target

}else if(price<this.ltp){
//assume support 

console.log('support');
    
}


},



        }
    }
</script>

<style scoped>

</style>