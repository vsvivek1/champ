<template>
    <div>
<!-- {{ margins }}  margin -->

<div v-if = "marginLoaded">
<v-alert>Margins</v-alert>
<div>
    <v-row>
        <v-col>
            Equity &nbsp;<v-chip>{{ margins.equity.net }} </v-chip>
            </v-col>
        <v-col>
Live balance&nbsp;<v-chip>{{ margins.equity.available.live_balance }} </v-chip>

        </v-col>
        <v-col></v-col>
    </v-row>
</div>
    </div>

    </div>
</template>

<script> 
import sessionMixin from '@/views/sessionMixin';
import axios from 'axios';
    export default { 
        name:"Margin",
        mounted(  ){ 

            setInterval((  ) =>{ 

                this.getMargins(  )
                
             } ,2*60*1000 )




         } ,
         mixins:[sessionMixin],
         data(  ){ 
return{ 

marginLoaded:false,
    margins:[],
 } 

          } ,

        methods:{ 

getMargins(  ){ 
this.marginLoaded = false;
let url = "/api/getMargins/accessTocken/"+this.accessToken;


axios.get( url ).then( res =>{ 


this. margins = res.data;

this.marginLoaded = true;

this.$emit( 'marginUpdated',this. margins )

 }  )

 } ,

         } 
     } 
</script>

<style lang = "scss" scoped>

</style>