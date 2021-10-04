<template>
    <div>

    </div>
</template>

<script>
  import sessionMixin from '@/views/sessionMixin';
  import axios from 'axios'


    export default {
        name:'OptionChain',
         mixins:[sessionMixin],
         mounted(){
this.getStrategy()

         },
         data(){

             return{
OptionChainType:'NSE',
OptionChains:[],
loadingContent:false,

             }
         },
         methods:{

                    getStrategy(){
                 this.loadingContent=true;
                 this.noData=false;

                let accessToken=this.accessToken;
const url = '/api/OptionChain/'+this.OptionChainType+'/accessToken/'+accessToken;

// alert(accessToken);
        axios.get(url).then(res => {

            
          this.OptionChains= res.data

          if(this.OptionChains.length==0){

            return false
          }

this.numberOfShares=this.OptionChains.length;

          this. returnedSymbolsForOHLC=this.OptionChains.map(s=>{
          
          if(typeof(s.instrument_token)=='undefined'){

            return 'NSE:'
          }else{

return  'NSE:'+s.instrument_token.tradingsymbol
          }
          // console.log(s.instrument_token.tradingsymbol)


           
            })
            
            
           this.loadingContent=false;

           if(this.OptionChains.length==0){
             this.noData=true;
           }
          
       return this. returnedSymbolsForOHLC

        }).then(r=>{

this.getOHLC(accessToken)
        })

               }
         }
    }
</script>

<style scoped>

</style>