

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
// import vuetify from './plugins/vuetify';
//import Vddl from 'vddl';

// import ripple from 'vuetify/lib/directives/ripple';

import {  BootstrapVue, IconsPlugin  }  from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files ( order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import {  VuePlugin  }  from 'vuera'

Vue.use( VuePlugin)

// Make BootstrapVue available throughout your project
Vue.use( BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use( IconsPlugin)


import 'vuetify/styles'
import {  createVuetify  }  from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify( { 
  components,
  directives,
 } )


Vue.use( vuetify, { 
  directives: { 
   
   } ,
 } );

// import Ripple from 'vuetify/lib/directives/ripple';
// Vue.use(vuetify, { 
//   directives: { 
//     Ripple,
//    } ,
//  } );
 
//Vue.use(Vddl);

import * as VueCookie from 'vue-cookie';
// Tell Vue to use the plugin
Vue.use(VueCookie);
// Vue.use(axios);

Vue.config.productionTip = false


new Vue({ 
  router,
  store,
  vuetify,
  render: h => h(App)
 } ).$mount('#app')

