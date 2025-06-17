

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

//import 'bootstrap'
//import 'bootstrap/dist/css/bootstrap.min.css'

//import Vddl from 'vddl';

//import vuetify from './plugins/vuetify';

import sessionMixin from "@/views/sessionMixin";
 

// import ripple from 'vuetify/lib/directives/ripple';

// import {  BootstrapVue, IconsPlugin  }  from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files ( order is important )
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'


// import {  VuePlugin  }  from 'vuera'

// Vue.use( VuePlugin )

// Make BootstrapVue available throughout your project
// Vue.use( BootstrapVue )
// Optionally install the BootstrapVue icon components plugin
// Vue.use( IconsPlugin )







// Vue.use( vuetify, { 
//   directives: { 
//     ripple,
//    } ,
//  }  );

// import Ripple from 'vuetify/lib/directives/ripple';
// Vue.use( vuetify, { 
//   directives: { 
//     Ripple,
//    } ,
//  }  );
 
//Vue.use( Vddl );

import VueCookie from 'vue-cookie';
// Tell Vue to use the plugin
Vue.use( VueCookie );

Vue.use( sessionMixin );
// Vue.use( axios );

Vue.config.productionTip = false

// import InstrumentsStatusView from './components/InstrumentsStatusView.vue'; // Adjust the path as needed

// // const app = createApp(App);

// app.component('InstrumentsStatusView', InstrumentsStatusView);





// Vue.use( vuetify );
Vue.prototype.$storeObjectInLocalStorage = function( key, value ) { 
  localStorage.setItem( key, JSON.stringify( value ));
 } ;

Vue.prototype.$getObjectFromLocalStorage = function( key ) { 
  const value = localStorage.getItem( key );
  return JSON.parse( value );
 } ;


Vue.prototype.$getAllObjectsFromLocalStorage = function(  ) { 
  const objects = [];
  for ( let i = 0; i < localStorage.length; i++ ) { 
    const key = localStorage.key( i );
    const value = localStorage.getItem( key );
    try { 
      const obj = JSON.parse( value );
      objects.push( obj );
     }  catch ( e ) { 
      // Ignore non-JSON values
     } 
   } 
  return objects;
 } ;
Vue.mixin( { 
  methods: { 




  //  cl( ...params ){ 


  //   let out='';
  //   for ( let i = 0; i < params.length; i++ ) { 
  //    out=out+' '+ params[i]
  //    } 


  //     console.log( out )
  //    } ,


    
  
  
  
     } ,
 } )


// console.log( globalConsoleLogs,'globalConsoleLogs')

// created( ) { 
//   this.$root.globalConsoleLogs = [];
//  } ,

// vuetify,


//import InstrumentsStatusView from './components/InstrumentsStatusView.vue'; // Adjust the path as needed

// const app = createApp(App);

// app.component('InstrumentsStatusView', InstrumentsStatusView);


//Vue.component('InstrumentsStatusView', InstrumentsStatusView);

// Create a new Vue instance
new Vue({
  el: '#app', // Mount point in the DOM
  router, // Inject router
  store, // Inject store
// Inject vuetify
  render: h => h(App) // Render the App component
});

