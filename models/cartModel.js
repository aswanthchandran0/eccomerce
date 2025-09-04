const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
     productId:{
      type: mongoose.Schema.Types.ObjectId,
       ref: "ProductDetails",
      required:true
     },
     quantity:{
        type: Number,
        default:1,
        required:true
     }
    }
    ],shippingPrice: {
        type:Number,
        default:0,
        required:true
    }, 
})
    
        cart = mongoose.model('Cart', cartSchema)
  
module.exports = cart