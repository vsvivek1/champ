const { isInteger } = require('lodash');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
// required:true
const StockInIndexSchema=new Schema({
                         
                            indexName:String,
                        
                        stocks:Array,
                       
                       






},{timestamps:true});

const StockInIndex=mongoose.model('StockInIndex',StockInIndexSchema);
module.exports=StockInIndex;