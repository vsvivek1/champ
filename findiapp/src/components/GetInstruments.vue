<template>
    <div>
<!-- {{headers}} -->
         <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="Instruments"
      :search="search"
    >
    
        <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Instruments</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- <v-switch
          v-model="singleExpand"
          label="Single expand"
          class="mt-2"
        ></v-switch> -->
      </v-toolbar>
    </template>
    
    </v-data-table>
  </v-card>>

<!-- <ul>
    <li v-for="(instrument,index) in Instruments" :key="instrument.instrument_token">
{{index}} of {{numberOfInstruments}}.{{instrument.tradingsymbol}} {{instrument}}

    </li>
</ul> -->

<!-- {{accessToken}}accessToken -->
    </div>
</template>

<script>
import axios from 'axios'
  import sessionMixin from '@/views/sessionMixin';
import store from '@/store';
    export default {

        data(){
return{

    search:''
}

        },
        mixins:[sessionMixin],
        name:'GetInstruments',
        mounted(){

this.getInstruments();
        },

        computed:{

            headers(){
let out=[];
var ob={};
ob.text='tradingsymbol';
ob.value='tradingsymbol';
out.push(ob);
var ob={};
ob.text='name';
ob.value='name';
out.push(ob);
var ob={};
ob.text='last_price';
ob.value='last_price';
out.push(ob);


return out;
              

// return Object.keys(JSON.parse(this.Instruments[0]))

            },
numberOfInstruments(){

return this.Instruments.length;
},

        Instruments:{
get(){

    return store.state.Instruments;
},
set(val){

    store.commit('setInstruments',val)
}

            },

        },
        methods:{

                 getInstruments() {
                     
        const url = '/api/getInstruments/' + this.accessToken
        axios.get(url).then(res => {
          this.Instruments = res.data
          
        //   .sort((a, b) => {
        //     return a.name - b.name
        //   })

        //   this.holdings.forEach(h => {


        //     h.investments = h.average_price * h.quantity;
        //     this.$set(h, 'PcSl', false);
        //     h.targetPc = false;

        //   })


        })

      }
        }
    }
</script>

<style scoped>

</style>