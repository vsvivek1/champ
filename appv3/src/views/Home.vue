<template>
  <div class="home">




<!-- {{Request_tocken}}  Request_tocken v-if="!Request_tocken==null" -->

<div class="container div col-sm-3">

   <div class="card" v-if="session!=null" >

     <!-- <div v-for="it in session " :key="it">{{it}}</div> -->

     
Welcome {{session.user_name}}  {{session.user_id}}

 <router-view/>
  </div>

<!-- <Margins></Margins> -->

</div>
<div class="container div col-sm-3">


 


 
</div>
<div class="container div col-sm-3">

<div v-if="session!=null">
Margin

</div>

</div>

<div v-if="session==null">
<Login></Login>
</div>
  <div class="container">
    <div class="row">
      <!-- <div class="col">    
</div> -->
      <div class="col-sm-12">



      </div>
    </div>
  </div>

    <!-- <ListHoldings v-if="accessToken"></ListHoldings> -->

    
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import ListHoldings from '@/components/ListHoldings.vue'
import Margins from '@/components/Margins.vue'
import Login from '@/components/Login.vue'
import store from '@/store';

// import ListHoldings from '../components/'


export default {
  name: 'Home',
  methods:{

getSessionDetailsFromCookies(){

  console.log('session from cookies',this.$cookie.get('session'))

this.session=JSON.parse(this.$cookie.get('session'));
this.accessToken=this.$cookie.get('accessToken');

},

  },

  mounted(){
// console.log('this.accessToken',this.accessToken)
    if(this.accessToken==null){

                this.$router.push('/login');
            }

    console.log('session',this.session)

this.getSessionDetailsFromCookies();

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
Request_tocken(){

    return store.state.Request_tocken
}

        },
  components: {


    ListHoldings,
    Login,Margins
  }
}
</script>
<style>
  .btn{
  background-color:rgb(255, 87, 34);
  color: ;
  }
</style>