const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
      userId:{
        type:String,
        required:true
       },  
       productDetails: [
         {
           productId: {
             type: String,
             required: true,
           },
           purchasedCount: {
             type: Number,
             required: true,
           },
         },
       ],
       
    address:{
        
        Fname:{
           type:String,
           required: true
        },
        
        Email:{
         type:String,
         required:true
        },
        PhoneNumber:{
          type:String,
          required:true
         },
       
        Pincode:{
           type:String,
           required:true
        },
        Address:{
           type:String,
           required:true
        },
        Place:{
           type:String,
           required:true 
        },
        state:{
           type:String,
           required:true
        },
        LandMark:{
           type:String,
           required:true
        },
        AphoneNumber:{
           type:String,
           required:true
        },
        AddressType:{
           type:String,
           required:true
        }
      }
     ,
     shippingPrice:{
        type:Number,
        required:true
     },
     Total:{
        type:Number,
        required:true
     },
     paymentMethod:{
        type:String,
        required:true  
     }, 
     orderStatus:{
      type:String,
      default:'active',
      required:true
     },
     orderDate:{
      type: Date,
      required:true
     },
     paymentStatus:{
      type:String,
      default:'Pending',
      required:true
     },
    
    
     
    
     
})


const order = mongoose.model('order',orderSchema)

module.exports = order