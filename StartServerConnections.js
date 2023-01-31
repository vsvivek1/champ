const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');

module.exports=function StartServerConnections(app,port,today){

    const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{
    
        

      
        app.listen(port, () => {
          console.log(`Server listening on the port::${port}`);
         
            
    
          console.log('mongo db connected4');
   
            
          AccesTocken.findOne({ 'date': today  },'access_token').then(e=>{              
                     
            let access_token=e.access_token;
            access_token_global=e.access_token;
            console.log('access_token: ',access_token)
        
    

            return access_token;
      })
      
      .catch(e=>console.log('error--access token @1620',access_token));
      ;
      
            
       
      
       
      
      })
    
        
      
    
     
    }).catch(error=>{
    
      console.log('mongo db connect error',error)
    
      // StartServerConnections()
    })
    
    }
    