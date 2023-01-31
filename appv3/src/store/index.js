import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    Request_token:'',
    accessToken:'',
    session:null,
    Instruments:[],
    NrInstruments:[]
    
  },
  mutations: {

    setNrInstruments(state,payload){

      state.NrInstruments=payload;
    },
    setInstruments(state,payload){

      state.Instruments=payload;
    },


    setSession(state,payload){

      state.session=payload;
    },


    setRequest_tocken(state,payload){

      state.Request_token=payload;
    },

    setAccessToken(state,payload){

      state.accessToken=payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
