const { isInteger } = require('lodash');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
// required:true
const mintTradeSchema =new Schema({
                            session:{
                        type:Object,
                        
                            },


                         script:String,
                         instrument_token:String,   
                        date:Date,
                        orderDetail:Object,
                        order_id:Number,
                        status:String,
                        


},{timestamps:true});

const MintTradeModel=mongoose.model('MintTrade',mintTradeSchema);

console.log('MintTradeModel',MintTradeModel)
module.exports=MintTradeModel;
