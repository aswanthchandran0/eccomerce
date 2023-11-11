const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    products:[{
     productId:{
      type:String,
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
    }
})
    
        cart = mongoose.model('Cart', cartSchema)
  
module.exports = cart