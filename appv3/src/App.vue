<template>
    <div id="app">
  
  <!-- {{session}} -->
      <v-app>
      <div id="nav">
        <router-link  v-if="session==null" to="/login">Login</router-link> |
        <router-link v-if="session!=null" to="/">Home</router-link> |
        <router-link to="/about">About</router-link> |
        <!-- <router-link to="/Validate">validate</router-link> | -->
       
       
        <router-link v-if="session!=null" to="/quickTargets">One Click Targets</router-link> |
        <router-link  v-if="session!=null" to="/holdings">Holdings</router-link> |
        <router-link  v-if="session!=null" to="/instruments">Instruments</router-link> |
        <router-link  v-if="session!=null" to="/orders">Order Book</router-link> |
        <router-link  v-if="session!=null" to="/NarrowRange">NarrowRange</router-link> |
        <router-link  v-if="session!=null" to="/LongBuildUps">Long Build Ups</router-link> |
        <router-link  v-if="session!=null" to="/Strategies">Strategies</router-link> |
       
  
       
       
        <router-link  v-if="session!=null" to="/WebSockets">WebSockets</router-link> |
        <router-link  v-if="session!=null" to="/ManiKandanStrategy">ManiKandan Strategy</router-link> |
        <router-link  v-if="session!=null" to="/StopLoss">StopLoss</router-link> |
        <router-link  v-if="session!=null" to="/Mint">Mint</router-link> |
  
  
        <router-link  v-if="session!=null" to="/Mining">Mining</router-link> |
       
       
       <router-link  v-if="session!=null" to="/NewFutureMining/NFO" >New Future Mining</router-link> |
  
   <!-- { name: 'NewFutureMining', params: { ITYPE: "NFO" } } -->
  
   <router-link  v-if="session!=null" to="/NewFutureMining/MCX" >Commodity</router-link>|
   <router-link  v-if="session!=null" to="/NewFutureMining/NSE" >NSE intraday</router-link>|

   <router-link  v-if="session!=null" to="/testWebSocket">testWebSocket</router-link> |

  
  
  
        <router-link  v-if="session!=null" to="/MiningMis">Mining-MIS</router-link> |
       <router-link  v-if="session!=null" to="/GTT">GTT</router-link> |
       <router-link  v-if="session!=null" to="/dailyGainers">Daily Gainers</router-link> |
     
     
       <router-link  v-if="session!=null" to="/BTST">BTST</router-link> |
       
       
  
       
        <router-link  v-if="session!=null" to="/OptionChain">OptionChains</router-link> |
  
        
  
        <!-- <router-link  v-if="session!=null" to="/REACT">REACT</router-link> | -->
  
        <a href="api/react">React</a> |
  
  
        <router-link v-if="session!=null" to="/logout">Log out</router-link> |
      
      
      </div>
      <router-view key="$route.params" />
  
      </v-app>
        </div>
  </template>
  
  <script>
    import store from '@/store';
  
  
  export default {
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
      }
  
  }
  
  </script>
  
  <style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  
  #nav {
    padding: 30px;
  
    a {
      font-weight: bold;
      color: #2c3e50;
  
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
  
  // @import './assets/styles/app.17a510a7.css';
  // @import './assets/styles/css.css';
  // @import './assets/styles/outer.d505d719.css';
  </style>