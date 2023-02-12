

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vddl from 'vddl';

import vuetify from './plugins/vuetify';
 

// import ripple from 'vuetify/lib/directives/ripple';

// import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'


// import { VuePlugin } from 'vuera'

// Vue.use(VuePlugin)

// Make BootstrapVue available throughout your project
// Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin)







// Vue.use(vuetify, {
//   directives: {
//     ripple,
//   },
// });

// import Ripple from 'vuetify/lib/directives/ripple';
// Vue.use(vuetify, {
//   directives: {
//     Ripple,
//   },
// });
 
Vue.use(Vddl);

import VueCookie from 'vue-cookie';
// Tell Vue to use the plugin
Vue.use(VueCookie);
// Vue.use(axios);

Vue.config.productionTip = false





// Vue.use(vuetify);


Vue.mixin({
  methods: {




   cl(...params){


    let out='';
    for (let i = 0; i < params.length; i++) {
     out=out+' '+ params[i]
    }


      console.log(out)
    },


    requireJson(url){

      return new Promise(async (res,rej)=>{
      
      let a =  await fetch
      (url).then(r=>r.json());
      
      res(a);
      })
      
      
      
      }
  },
})


// vuetify,
new Vue({
  router,
  store,
  vuetify,
 
  render: h => h(App)
}).$mount('#app')

