const AccessTocken=require('./models/AccessTokens');
const mongoose=require('mongoose');
require('dotenv').config();
const url=process.env.MONGO_URL+process.env.DB_NAME;
const myDbName=process.env.DB_NAME;
// mongoose.connect(url+myDbName,{useNewUrlParser: true, useUnifiedTopology: true});

let today=new Date().toISOString().slice(0,10);

const schemas = [];
mongoose.modelNames().forEach(function(modelName){
    schemas.push(mongoose.model(modelName).schema.obj);
})

console.log(schemas);

return false;



// const Person = mongoose.model('Person', yourSchema);


let AccessTockenSchema=mongose.Schema({

    _id:mongose.Schema.Types.ObjectId,
    date:Date,
    access_token:String,
    user_id:String,
// useNewUrlParser: true 
})

module.exports=mongose.model('AccessTocken',AccessTockenSchema);

// const At=new AcceesTocken(

//     {
//         _id:new mongoose.Types.ObjectId(),
//         date:today,
//         access_token:123,
//         customerId:'DV',
//         age:123

//     }

    

// );

// At.save().then(res=>{

//     console.log('result of saving',res)
// }).catch((e)=>{

//     console.log('got an error',e)
// })