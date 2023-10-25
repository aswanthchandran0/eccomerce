const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    images: [{
        type: String,
        required: true,
    }],
    ProductName:{
        type:String,
        required:true
    },

    ProductDiscription:{
        type:String,
        required:true,
    },
    ProductPrice:{
     type:Number,
     required:true
    },
    ProductDiscount:{
        type:Number,
        required:true
    }
})


const ProductDetails = mongoose.model('ProductDetails', productSchema)

module.exports = ProductDetails