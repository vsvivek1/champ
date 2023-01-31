<template>
    <div>


      <div class="loading" v-if="loadingContent">



  <div>
   
    <v-progress-linear
      indeterminate
      color="green"
    ></v-progress-linear>
    <br>
    
  </div>

<!-- loading... {{holdingLength}} -->
</div>

        <!-- {{NrInstruments}} -->

      <ul class="lits-item-group">
        <li class="list-item" v-for ="NrInstrument in NrInstruments"  :key="NrInstrument._id">
<v-row>
  <v-col>{{NrInstrument.tradingsymbol}}</v-col>
  <v-col>{{NrInstrument.date}}</v-col>
  <v-col>{{NrInstrument.low}}</v-col>
  <v-col>{{NrInstrument.high}}</v-col>
  <v-col>{{NrInstrument.range}}</v-col>
  <v-col></v-col>
</v-row>

        </li>
      </ul>

    </div>
</template>

<script>
import axios from 'axios'
  import sessionMixin from '@/views/sessionMixin';
import store from '@/store';
    export default {
        name:'NarrowRange',
        data(){
return {

  loadingContent:false,
}

        },
         mixins:[sessionMixin],
        name:'GetInstruments',
        mounted(){

this.getNarrowRange();
        },
           methods:{

                 getNarrowRange() {
                   this.loadingContent=true;
                   let range=4
        const url = '/api/NrInstruments/' + this.accessToken+'/range/'+range;
        axios.get(url).then(res => {
          this.NrInstruments = res.data
          this.loadingContent=false
          
       

        })

      }
        },computed:{
        NrInstruments:{
get(){

    return store.state.NrInstruments;
},
set(val){

    store.commit('setNrInstruments',val)
}

        }

        
    }
    }
</script>

<style scoped>

</style>