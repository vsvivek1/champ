<template>
    <div>
<!-- {{margins}} margin -->
<v-alert>Margins</v-alert>
<v-container>
    <v-row>
        <v-col>
            Equity &nbsp;<v-chip>{{margins.equity.net}}</v-chip>
            </v-col>
        <v-col>
Live balance&nbsp;<v-chip>{{margins.equity.available.live_balance}}</v-chip>

        </v-col>
        <v-col></v-col>
    </v-row>
</v-container>
    </div>
</template>

<script> 
import sessionMixin from '@/views/sessionMixin';
import axios from 'axios';
    export default {
        name:"Margin",
        mounted(){
this.getMargins()

        },
         mixins:[sessionMixin],
         data(){
return{

    margins:[],
}

         },

        methods:{

getMargins(){

let url="/api/getMargins/accessTocken/"+this.accessToken;


axios.get(url).then(res=>{


this. margins=res.data;

})

},

        }
    }
</script>

<style lang="scss" scoped>

</style>