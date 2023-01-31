<template>
    <div>

        profit {{profit}}

<v-btn @click="getDailyGainers()">get</v-btn>
<v-btn @click="getDailyLosers()">get</v-btn>
      

       count <v-chip color="green">{{gainerList.length}}</v-chip>
       reds <v-chip color="red">{{reds}}</v-chip>
      green <v-chip color="green">{{greens}}</v-chip>
     
     
    upperShadowGreaterThanBody<v-chip color="green">{{upperShadowGreaterThanBody}}</v-chip>
     lowerShadowGreaterThanBody<v-chip color="green">{{lowerShadowGreaterThanBody}}</v-chip>
<table class="table table-bordered table-hover table-stripped">
    <thead>
        <th>#</th>
        <th>Script</th>
        <th>pC</th>
        <th>yday candle</th>
        <th></th>
    </thead>
    <tbody>
        <tr v-for="(gainer,index) in gainerList" :key="index">
            <td>{{index+1}}</td>
            <td>
            
            <a target="_blank" :href="gainer.chart">
            
            {{gainer.tradingsymbol}}</a>
            
            </td>
            <td>{{gainer.profitPc}}
            
            <small>{{gainer.profitTot}}</small>
            </td>
            <td>{{gainer.otherCriteria}}</td>
            <td
            >
            {{gainer.ohlc.ohlc}}
            
            </td>
        </tr>
    </tbody>
</table>


    </div>
</template>

<script>

import axios from 'axios';
import sessionMixin from "@/views/sessionMixin";

    export default {

        computed:{

      

lowerShadowGreaterThanBody(){
return this.gainerList.filter(r=>{
    
 try{

if(r.otherCriteria.lowerShadow>r.otherCriteria.body)
{

    return true
}else{

    return false
}

 } catch(error){

    return false;
 }
    
    
    
    }
    
    
    
    ).length

},

upperShadowGreaterThanBody(){
return this.gainerList.filter(r=>{
    
 try{

if(r.otherCriteria.upperShadow>r.otherCriteria.body)
{

    return true
}else{

    return false
}

 } catch(error){

    return false;
 }
    
    
    
    }
    
    
    
    ).length

},



reds(){
    // return 1
return this.gainerList.filter(r=>{
    
 try{

if(r.otherCriteria.candleColor=='red')
{

    return true
}else{

    return false
}

 } catch(error){

    return false;
 }
    
    
    
    }
    
    
    
    ).length

},greens(){

    // return 1



return  this.gainerList.filter(r=>{
    
     try{

if(r.otherCriteria.candleColor=='green' || r.otherCriteria.candleColor=='red')
{

    return true
}else{

    return false
}

 } catch(error){

    return false;
 }

}
    
    ).length

}

        },

         mixins: [sessionMixin],
data(){

    return {
gainerList:[],
loserList:[],
profit:0,

    }
},
        mounted(){
// this.getDailyGainers()

        },
        methods:{

                  getProfit(){

let out=0;

this.gainerList.forEach(e=>out=out+e.profitTot)
    this.profit=out;               
let a= this.gainerList.reduce(
    
    (pvs,cur)=>pvs+cur.profitTot,0)

            },

            getDailyLosers(){
let url="/api/dailyLosers/"+this.accessToken;

axios.get(url).then( (r) => {
    this.gainerList=r.data
    

  
    // . sort((a,b)=>a.profitPc-b.profitPc)
    
   
}
    )

            },

            getDailyGainers(){
let url="/api/dailyGainers/"+this.accessToken;

axios.get(url).then( (r) => {
    this.gainerList=r.data

      this.getProfit()
    
    // .    sort((a,b)=>a.profitPc-a.profitPc)
    
   
}
    )
            },
        
        
    },
    name:'dailyGainers'
    }
</script>

<style lang="scss" scoped>

</style>