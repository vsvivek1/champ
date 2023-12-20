<template>
    <div>

        <h1>Messages table</h1>
      <div v-for = "message in messages1" :key = "message.id">
        {{  message.text  }} 
      </div>
    </div>
  </template>
  
  <script>
  export default { 
    data(  ){ 
return { 


    messages1:[],
 } 


     } ,
    props: { 
      messages: { 
        type: Array,
        required: true
       } 
     } ,
    mounted(  ) { 

        // this.messages1 = this.messages;
      // Clear messages that are more than 2 hours old
      setInterval((  )  => { 
        const currentTime  =  new Date(  ).getTime(  )
        this.messages1  =  this.messages.filter( message  => { 
          return currentTime - message.timestamp < 7200000
         }  );
        
       } , 60000 )
     } 
   } 
  </script>