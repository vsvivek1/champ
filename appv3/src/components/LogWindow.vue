<template>
    <div class = "log-window">
      <div class = "header">
       
        <h3>Log Window</h3>
      <button @click = "clearLogs">Clear Log</button>
      </div>
      <ul>
        <li v-for = "( logs,index ) in logs" :key = "index">{{  log  }} </li>
      </ul>
     
    </div>
  </template>
  
  <script>
  import {  mapState, mapActions  }  from 'vuex';
  
  export default { 
    computed: { 
      ...mapState( ['logs'] ),
     } ,
    methods: { 
      ...mapActions( ['clearLogs'] ),
     } ,
   } ;
  </script>
  
  <style>
  .log-window { 
    background-color: #f6f7f9;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba( 0, 0, 0, 0.1 );
    /* max-width: 250px; */
    width: 100%;
    padding: 10px;
    overflow-y: scroll;
    height: 100px;
    position: fixed;
    top:10%;
    
    /* bottom: 0; */
    left: 0;
    /* right: 0;
    margin: auto; */
   } 
  
  .header { 
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
   } 
  
  h3 { 
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #0b6cdb;
   } 
  
  button { 
    padding: 10px 15px;
    border-radius: 5px;
    background-color: #4267b2;
    border: none;
    color: white;
    cursor: pointer;
   } 
  
  li { 
    list-style-type: none;
    margin-bottom: 10px;
    padding: 10px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0px 0px 5px rgba( 0, 0, 0, 0.1 );
    border:1px solid grey;
   } 
  </style>
  