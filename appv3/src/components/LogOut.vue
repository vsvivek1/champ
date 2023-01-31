<template>
    <div>

        <button v-if="CookiseSession" @click="logOut()" class="btn btn-danger">Confirm Log out</button>


<div class="alert alet-danger" v-else>
    You have Already Logged out !
</div>
    </div>
</template>

<script>
import store from '@/store';
    export default {
        name:'LogOut',

        mounted(){

this.CookiseSession=JSON.parse(this.$cookie.get('session'));
        },

          data(){

                     return{
CookiseSession:{},

                     }
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
             },
        methods:{

            removeCookies(){

                let domainName=window.location.hostname;

               
               

this.$cookie.delete('session', {domain: domainName});
this.$cookie.delete('accessToken', {domain: domainName});


this.session=null;
this.accessToken=null;

this.CookiseSession=null;

 this.$router.push('/');

            },

            logOut(){
this.removeCookies();



            }
        }
    }
</script>

<style scoped>

</style>