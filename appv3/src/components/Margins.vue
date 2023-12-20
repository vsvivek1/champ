<template>
    <div>
{{ AccessTocken }}  margin page
    </div>
</template>

<script>
import axios from 'axios'

import store from '@/store';
    export default { 
        name:'Margins',
methods:{ 
  getAccessTocken(  ){ 
let url = "/api/getAccessTocken";


axios.get( url ).then( res =>{ 

    this.AccessTocken = res.data
 }  );

return;
let AccessTockenPromise = 

new Promise(( resolve, reject )  => { 


resolve( this.AccessTocken );



       }  )    } ,
        getMargins(  ){ 


         } 

 } ,

        mounted(  ){ 
this.getAccessTocken(  )

// .then( res =>{ 

// console.log( 'getAccessTockenfrom resolve',res )

//  }  );

         } ,
        computed:{ 
AccessTocken:{ 

get(  ){ 

    return store.state.AccessTocken;
 } ,set( payload ){ 
    store.commit( 'setAccessTocken',payload )
 } 

 } 


         } ,

     
     } 
</script>

<style scoped>

</style>