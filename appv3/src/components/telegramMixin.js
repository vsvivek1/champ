const telegramMixin = {
methods:{

    sendToTelegramGroup( text ) { 
        return;
        if ( true ) { 
          let obj  =  {  } ;
          obj.chat_id  =  this.chat_id;
          obj.text  =  text;
  
          let urlToSendMessage  =  `https://api.telegram.org/bot${ this.token } /sendMessage`;
  
          axios
            .post( urlToSendMessage, obj )
            .then(( r )  => { 
              // this.cl( 'from bot ',r.data.result[0] )
             }  )
            .catch(( e )  => e );
          // this.cl( 'from bot ',r.data.result[0].channel_post.chat.id )
         } 
       } ,
    async getChatId() { 
        return;
        this.chat_id  =  -1;
        if ( this.chat_id !=  1 ) { 
          let url  =  `https://api.telegram.org/bot${ this.token } /getUpdates`;
  
          return axios
            .get( url )
            .then(( r )  => { 
              this.chat_id  =  r.data.result[0].channel_post.chat.id;
  
              return this.chat_id;
             }  )
            .catch(( e )  => e );
  
          var txt  =  "First time";
         } 
       } ,

},

    mounted() {
        console.log('hello from mixin!');
    },
};

export default telegramMixin;