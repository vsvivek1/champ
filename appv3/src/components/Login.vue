<template>
    <div>

        

<button @click="redirectToLogin" style="color: red;">Login using Zerodha Kite</button>
   </div>

</template>

<style>
.your-class {
    color: red !important;
    /* Any other styles you want to override */
}
</style>

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

            redirectToLogin() {
      // Perform the action to redirect to the login page
      window.location.href = 'https://kite.zerodha.com/connect/login?v=3&api_key=wkcurst2vu5obug7';
    },

            getCookies(  ){ 
this.$cookie.get( 'session' );


             } ,

            login(  ){ 
let url=""
                
             } 
         } 
     } 
</script>

