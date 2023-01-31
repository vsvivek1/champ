const mongose=require('mongoose');

let AccessTockenSchema=mongose.Schema({

    _id:mongose.Schema.Types.ObjectId,
    date:Date,
    access_token:String,
    user_id:String,
// useNewUrlParser: true 
})

module.exports=mongose.model('AccessTocken',AccessTockenSchema);