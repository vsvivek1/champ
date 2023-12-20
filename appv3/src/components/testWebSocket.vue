<template>
    <div>
      <h1>Real-time Subscriptions</h1>
      <ul>
        <li v-for = "tick in ticks" :key = "tick.timestamp">{{  tick.timestamp  }}  - {{  tick.price  }} </li>
      </ul>
    </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  
  export default { 
    data(  ) { 
      return { 
        ticks: []
       } 
     } ,
    mounted(  ) { 
      this.socket  =  io( "http://127.0.0.1:4000"


 );

console.log( this.socket )
this.socket.on( 'connect', (  )  => { 
  console.log( 'Connected to server' );
 }  );

this.socket.on( 'disconnect', (  )  => { 
  console.log( 'Disconnected from server' );
 }  );

this.socket.on( 'message', ( data )  => { 
  console.log( 'Received message:', data );
 }  );

this.socket.emit( 'send', {  message: 'Hello server'  }  );


      this.socket.emit( 'subscribe-orders',
      
      JSON.stringify( [260105, 256265, 264969, 39466754, 39466242, 39465730, 39465218, 39464706, 39464194, 39463682, 39463426, 39462914, 39462402, 39461890, 39460866, 39460354, 39461378, 39432962, 39432450, 39431938, 39431426, 39430658, 39430146, 39429634, 39408386, 39407874, 39407362, 39406850, 39406338, 39405826, 39405570, 39405058, 39404546, 39404034, 39403522, 39403010, 39402498, 39369474, 39367938, 39367426, 39366914, 39366146, 39364610, 39340290, 41698562, 39339778, 41698050, 39339266, 41697538, 39339010, 41697282, 39338498, 41696770, 39337986, 39337474, 10544386, 10543362, 39314690, 10539010, 39315202, 39314178, 10537474, 39313666, 10534402, 39313410, 10534146, 39312898, 10533378, 39312386, 10532866, 10528258, 39311362, 39311874, 10527234, 39282434, 39282946, 39283458, 39281410, 39281922, 39280898, 39280642, 39280130, 39279618, 39279106, 39278594, 39255810, 39255298, 39254786, 39254274, 39253762, 39253250, 39252994, 39252482, 39251970, 39251458, 39250946, 39250434, 39220994, 39220482, 39219970] ));
      this.socket.on( 'send-realtime-subscription', ( tick )  => { 

        console.log( { tick }  );
        this.ticks.push( tick );
       }  );
     } ,
    beforeDestroy(  ) { 
      this.socket.disconnect(  );
     } 
   } 
  </script>
  