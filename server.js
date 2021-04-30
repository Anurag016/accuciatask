const express =  require('express');
const app = express();
const http = require('http');
const path = require('path');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/task');
mongoose.connection.on('connected', () => {
    console.log('Connected to Database localhost:27017/task');
  });

// On Error
mongoose.connection.on('error', (err) => {
    console.log('Database error '+err);
  });

const port = process.env.PORT || 3010;

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
var category_model = require("./model/category_model");
var product_model = require("./model/product_model");

app.listen(port, () => {
    console.log('Server started on port '+port);
  });

app.use("/insertProduct",function(req,res){
console.log("insert",req.body);
category_model.findOne({category_name:req.body.category_name},function(err,data){
    if(data==null){
        //create new category and insert product
        var new_category = new category_model({
            category_name:req.body.category_name,
            createdAt:Date.now(),
            updatedAt:Date.now()
        })
        new_category.save(function(err,save_data){
            if(err){
                console.log(err);
                res.status(400).json({status:"Error in creating new category"});return;}
            else{
                var new_product = new product_model({
                    product_name:req.body.product_name,
                    quantity:req.body.quantity,
                    price:req.body.price,
                    category_id:save_data._id,
                    createdAt:Date.now(),
                    updatedAt:Date.now()
                })
                new_product.save(function(err,data){
                    if(err){res.status(400).json({staus:"error in insert product"})}
                    else{res.status(200).json({status:"new product inserted"})}
                })
            }
        })
    }
    else{
        //check product already exist
        product_model.findOne({product_name:req.body.product_name,category_id:data._id},function(err2,data2){
            if(data2==null){
                //insert product in category
                var in_product = new product_model({
                    product_name:req.body.product_name,
                    quantity:req.body.quantity,
                    price:req.body.price,
                    category_id:data._id,
                    createdAt:Date.now(),
                    updatedAt:Date.now()
                })
                in_product.save(function(err3,data3){
                    if(err3){res.status(400).json({status:"error in inserting product"})}
                    else{res.status(200).json({status:"product inserted"})}
                })
            }
            else{
                //product already exist
                res.status(200).json({status:"Product Alredy Exist"});
            }
        })
    }
})
});

app.use("/updateProduct",function(req,res){
category_model.findOne({category_name:req.body.category_name},function(err,data){
if(err){res.status(400).json({status:"error in updating product"})}
else{
    product_model.findOneAndUpdate({category_id:data._id,product_name:req.body.product_name},
        {
            $set:{
                quantity:req.body.quantity,
                price:req.body.price,
                updatedAt:Date.now()
            }
        },
        function(err2,data2){
            if(err2){res.status(400).json({status:"error in updating"})}
            else{
                category_model.findOneAndUpdate({category_id:data._id},
                    {$set:{
                        updatedAt:Date.now()
                    },function(err3,data3){
                        if(err3){
                            res.status(400).json({staus:"error in updating"})
                        }
                        else{
                        res.status(200).json({status:"product details updated"})   
                        }
                    }})
               }
    })
}    
})
});

app.use("/getproductDetails",function(req,res){
    category_model.aggregate([
        {$match:{category_name:req.body.category_name}},
        {
            $lookup:{
                from:'product_data',
                localField:'_id',
                foreignField:'category_id',
                as:'category_details'
            }
        },
        {
            $project:{
                _id:1,
                category_name:1,
                createdAt:1,
                updatedAt:1,
                category_details:1
            }
        }
    ]).exec(function(err2,data){
        if(err2){res.status(400).json({status:"error in getting data"})}
        else{res.status(200).json({status:"success",data:data})}
    })
});

app.use("/deleteProduct",function(req,res){
    //check category
    category_model.findOne({category_name:req.body.category_name},function(err,data){
        if(data==null){
            //if category not exist
            res.status(404).json({status:"product category not found"})
        }
        else{
            //find in product and delete
            product_model.findOneAndDelete({category_id:data._id,product_name:req.body.product_name},function(err2,data2){
                if(data2==null){
                    res.status(404).json({status:"product not found"})
                }
                else if(err2){res.status(400).json({status:"error in deletion"})}
                else{res.status(400).json({status:"deleted successfully"})}
            })
        }
    })
});