<template>
    <div>

        <div :key="index" v-for="(instrument,index) in instruments">
<a target="_blank"  :href=" instrument.chart">{{ instrument.tradingsymbol }}</a>
            
            <TimePriceHigh  :symbol="instrument.instrument_token"></TimePriceHigh>
            <hr>
        </div>
        
    </div>
</template>

<script>
  import sessionMixin from '@/views/sessionMixin';
import TimePriceHigh from './TimePriceHigh.vue';
    export default {
        mounted(){
           this. getInstruments()

        },
        mixins:[sessionMixin],
        components: {
    TimePriceHigh
  },
        methods:{
async getInstruments(){

    await  fetch("../../../../instruments/instrumentsForMining.json")
      .then((response) => response.json())
      .then((data) => 
      {


        // console.log(data,'data1')
        this.instruments = data;
      }
);
    }
        },
        data(){

            return{
                instruments:[]

            }
        },
       
    }
</script>

<style lang="scss" scoped>

</style>