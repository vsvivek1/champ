const mongose=require('mongoose');

let NarrowRanges=mongose.Schema({

    _id:mongose.Schema.Types.ObjectId,
    date:Date,
    open:Number,
    high:Number,
    low:Number,
    close:Number,
    volume:Number,
    range:Number,
    tradingsymbol:String,
    instrument_token:String,
    generatedDate:Date
// useNewUrlParser: true 
})

// module.exports=mongose.model('NarrowRange',NarrowRanges);