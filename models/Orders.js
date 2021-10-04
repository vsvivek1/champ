const { isInteger } = require('lodash');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
// required:true
const orderSchema=new Schema({
                            session:{
                        type:Object,
                        
                            },
                        
                        orderDetail:Object,
                        order_id:Number,
                        order_status:String


},{timestamps:true});

const Order=mongoose.model('Order',orderSchema);
module.exports=Order;