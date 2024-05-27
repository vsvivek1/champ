import Vue from 'vue'
import Vuex from 'vuex'


Vue.use( Vuex )

export default new Vuex.Store( { 
  state: { 
    Request_token:'',
    accessToken:'',
    session:null,

    NrInstruments:[],
    
    logs: [],
   } ,
  mutations: { 
    
    
    addLog( state, log ) { 
      state.logs.push( log );
     } ,
    clearLogs( state ) { 
      state.logs  =  [];
     } ,
    setNrInstruments( state,payload ){ 

      state.NrInstruments = payload;
     } ,
    setInstruments( state,payload ){ 

      state.Instruments = payload;
     } ,


    setSession( state,payload ){ 

      state.session = payload;
     } ,


    setRequest_tocken( state,payload ){ 

      state.Request_token = payload;
     } ,

    setAccessToken( state,payload ){ 

      state.accessToken = payload;
     } 
   } ,
  actions: { 

    addLog( {  commit  } , log ) { 
      commit( 'addLog', log );
     } ,
    clearLogs( {  commit  }  ) { 
      commit( 'clearLogs' );
     } ,
   } ,
  modules: { 
   } 
 }  )
