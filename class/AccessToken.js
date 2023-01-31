
const mongoose=require('mongoose');
let AccesTocken=require('../models/AccessTokens');

module.exports =class AccessToken {

   constructor(){
        this.access_token ; 

        
    }


    async getAccessToken(){


        return new Promise(async (res,rej)=>{
        
        
        const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
        
        
        let today=this.today();;
        this.access_token  = await AccesTocken.
        findOne({ 'date': today },'access_token').then(e=>e.access_token);
      
    
        res(this.access_token)
        return 
    })

    }

  today(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD')
    } 


}