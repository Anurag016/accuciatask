const { ObjectID } = require('bson');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const productSchema = new Schema({
    product_name:{
        type:String
    },
    createdAt:{
        type:Date
    },
    quantity:{
        type:Number
    },
    price:{
        type:Number
    },
    updatedAt:{
        type:Date
    },
    category_id:{
        type:ObjectID
    }
});
module.exports = mongoose.model("product_data",productSchema,"product_data");