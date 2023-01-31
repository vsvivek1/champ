const { isInteger } = require('lodash');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
// required:true
const FailedOrderSchema =Schema({
                            session:{
                        type:Object,
                        
                            },


                        
                        orderDetail:Object,
                        order_id:Number,
                        status:String,
                        error_msg:Object,


},{timestamps:true});

const FailedOrder=mongoose.model('FailedOrder',FailedOrderSchema);
module.exports=FailedOrder;

