<template>
    <div>

    <div class="alert alert-danger" v-if="requestTockenSettingError">{{requestTockenSettingErrorMsg}} </div>


    </div>
</template>

<script>
import axios from 'axios'

import store from '@/store';
    export default {
        name:'Validate',
        methods:{


setCookies(){
    const midnight = new Date()
midnight.setHours(24,0,0,0)


    let session_string=JSON.stringify(this.session);
this.$cookie.set('session', session_string, {
  expires: midnight
});
this.$cookie.set('accessToken', this.accessToken, {
  expires: midnight
});

},

        },

        computed:{

            session:{
get(){

    return store.state.session;
},
set(val){

    store.commit('setSession',val)
}

            },
            accessToken:{
get(){

    return store.state.accessToken;
},
set(val){

    store.commit('setAccessToken',val)
}

            },



Request_tocken:{
    get(){
 return store.state.Request_tocken
    },set(v){

        store.commit('setRequest_tocken',v)
    }

   
}

        },

        data(){

            return{

requestTockenSettingError:false,
requestTockenSettingErrorMsg:'',

            }
        },

        mounted(){

           console.log('mounted validate outside',this.$route.query.action) 

        //    this.$route.query.action=="login" && 

        if(this.$route.query.status=="success"){


console.log('mounted validate',this.$route.query)
            store.commit('setRequest_tocken',this.$route.query.request_token)

            var toc={}; 
            toc.Request_tocken=this.$route.query.request_token
this.requestTockenSettingError=false;// resetting errors
this.requestTockenSettingErrorMsg='';// resetting errors
        //    +'?Request_tocken='+this.$route.query.request_token;
          
          const url = '/api/setRequestTocken'
           axios.post(url,toc).then(res=>{

               console.log('this is session',this.session,res)

               this.session=res.data;

this.accessToken=res.data.access_token;

                 this.setCookies();  //setting cookies

// console.log('from cookies',this.$cookie.get('session'));

            }).catch(err=>{

this.requestTockenSettingError=true;
this.requestTockenSettingErrorMsg=err;
            })

            this.$router.push('/')
        }
        }
    }
</script>

<style scoped>

</style>