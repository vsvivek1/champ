<template>
    <div>

        <a type="button" href="https://kite.zerodha.com/connect/login?v=3&api_key=wkcurst2vu5obug7"
         class="btn btn-danger text-secondary"> 
       
         
         Login using Zerodha Kite</a>
   </div>

</template>

<script>
import axios from 'axios'
import store from '@/store';
    export default { 
        name:'Login',
computed:{ 
           session:{ 
get(  ){ 

    return store.state.session;
 } ,
set( val ){ 

    store.commit( 'setSession',val )
 } 

             } ,
            accessToken:{ 
get(  ){ 

    return store.state.accessToken;
 } ,
set( val ){ 

    store.commit( 'setAccessToken',val )
 } 

             } ,

 } ,


        data(  ){ 

            return{ 


             } 
         } ,

        mounted(  ){ 


         } ,
        methods:{ 

            getCookies(  ){ 
this.$cookie.get( 'session' );


             } ,

            login(  ){ 
let url=""
                
             } 
         } 
     } 
</script>

<style scoped>

</style>