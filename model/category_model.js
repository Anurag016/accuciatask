const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    category_name:{
        type:String
    },
    createdAt:{
        type:Date
    },
    updatedAt:{
        type:Date
    }
});
module.exports = mongoose.model("category_data",categorySchema,"category_data");