import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Validate from '@/components/Validate.vue'
import LogOut from '@/components/LogOut.vue'
import Login from '@/components/Login.vue'
import NewFutureMining from '@/components/NewFutureMining.vue'

import ListHoldings from '@/components/ListHoldings.vue'
import testWebSocket from '@/components/testWebSocket.vue'

 import PlaceQuickOrderForHoldings from '@/components/PlaceQuickOrdersForHoldingsNew.vue'
// import GetInstruments from '@/components/GetInstruments.vue'
 import OrderBook from '@/components/OrderBook.vue'
// import NarrowRange from '@/components/NarrowRange.vue'
// import LongBuildUp from '@/components/LongBuildUp.vue'
import Strategies from '@/components/Strategies.vue'
// import WebSockets from '@/components/WebSockets.vue'
// import OptionChain from '@/components/OptionChain.vue'
// import ManiKandanStrategy from '@/components/ManiKandanStrategy.vue'
// import StopLoss from '@/components/StopLoss.vue'
// // import Mint from '@/components/Mint.vue' -->
// import Mining from '@/components/Mining.vue'
// import MiningMis from '@/components/MiningMis.vue'
import GTT from '@/components/GTT.vue'
import Tester from '@/components/Tester.vue'
import FutureTrading from '@/components/FutureTrading.vue'
// import BTST from '@/components/Btst.vue'
// import dailyGainers from '@/components/dailyGainers.vue'

// import MiningFuture from '@/components/MiningFuture.vue'
// import FutureMining from '@/components/FutureMining.vue'

// import rec from '@/components/React.vue'

// import Commodity from '@/components/Commodity.vue'

// findiserver/appreact/src/App.js

// /home/kseb/findependence/findiapp/src/components/PlaceQuickOrdersForHoldings.vue
Vue.use(VueRouter)

const routes = [

  {
    path: '/FutureTrading',
    name: 'FutureTrading',
    component: FutureTrading
  },   {
    path: '/testWebSocket',
    name: 'testWebSocket',
    component: testWebSocket
  },   
  
  {
    path: '/Tester',
    name: 'Tester',
    component: Tester
  }, 
  
  
  // {
  //   path: '/Commodity',
  //   name: 'Commodity',
  //   component: Commodity
  // },  
  
  // {
  //   path: '/FutureMining',
  //   name: 'FutureMining',
  //   component: FutureMining,
  //   props:{"ITYPE":"NFO"}
  // },  
  //   {
  //   path: '/BTST',
  //   name: 'BTST',
  //   component: BTST
  // }, 

  // {
  //   path: '/dailyGainers',
  //   name: 'dailyGainers',
  //   component:dailyGainers
  // },
  

  
  
  // {
  //   path: '/REACT',
  //   name: 'REACT',
  //   component:rec
  // }, 
    {
    path: '/GTT',
    name: 'GTT',
    component: GTT
  }, 
  
  
  // {
  //   path: '/Mining',
  //   name: 'Mining',
  //   component: Mining
  // }, 
  
  
  
  // {
  //   path: '/MiningMis',
  //   name: 'MiningMis',
  //   component: MiningMis
  // }, 
  
  
  // <!-- {
  //   path: '/mint',
  //   name: 'mint',
  //   component: Mint
  // },  
  
  // { -->

    {
    path: '/NewFutureMining/:itype',
    name: 'NewFutureMining',
    component: NewFutureMining,
 
    props:{'itype:': 'NFO'}
  }, 
  
  // {
  //   path: '/StopLoss',
  //   name: 'StopLoss',
  //   component: StopLoss
  // }, 
  //   {
  //   path: '/ManiKandanStrategy',
  //   name: 'ManiKandanStrategy',
  //   component: ManiKandanStrategy
  // }, 
  
  // {
  //   path: '/OptionChain',
  //   name: 'OptionChain',
  //   component: OptionChain 
  // },
  // {
  //   path: '/WebSockets',
  //   name: 'WebSockets',
  //   component: WebSockets 
  // },
  // {
  //   path: '/LongBuildUps',
  //   name: 'LongBuildUp',
  //   component: LongBuildUp 
  // },
  {
    path: '/Strategies',
    name: 'Strategies',
    component: Strategies 
  },
  // {
  //   path: '/NarrowRange',
  //   name: 'NarrowRange',
  //   component: NarrowRange 
  // },
  {
    path: '/login',
    name: 'login',
    component: Login 
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrderBook
  },
  // {
  //   path: '/instruments',
  //   name: 'GetInstruments',
  //   component: GetInstruments 
  // },
  {
    path: '/logout',
    name: 'LogOut',
    component: LogOut
  },
  // {
  //   path: '/holdings',
  //   name: 'holdings',
  //   component: ListHoldings
  // },
  {
    path: '/Validate',
    name: 'Validate',
    component: Validate 
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/quickTargets',
    name: 'PlaceQuickOrderForHoldings',
    component: PlaceQuickOrderForHoldings
  },

  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
   
})

// router.beforeEach((to, from, next) => {
//   if (to.fullPath.substr(0,2) === "/#") {
//     const path = to.fullPath.substr(2);
//     next(path);
//     return;
//   }
//   next();
// });
// mode: 'history',

export default router
