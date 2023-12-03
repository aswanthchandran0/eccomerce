const Razorpay = require('razorpay');
const crypto = require('crypto')
const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
let id
const paymentGateway = { 
  generateRazorPay: async (orderId, totalPrice) => {
    id=orderId
    console.log('orderId:', orderId);
    console.log('totalPrice:', totalPrice);
    const  totalPriceInPaise =Math.round(totalPrice * 100)
    try {
      console.log('total price in generated razor'+totalPrice);
      var instance = new Razorpay({
        key_id: process.env.PAYMENT_GATEWAY_key_id,
        key_secret: process.env.PAYMENT_GATEWAY_key_secret,
      });

      const order = await instance.orders.create({
        amount: totalPriceInPaise,
        currency: 'INR',
        receipt: ""+orderId, 
        notes: {
          key1: 'value3',
          key2: 'value2',
        },
      });

      return order;
    } catch (error) {
      console.error(error);
    }
  },
  verifyPayment: async (req,res)=>{
    const userId= req.session.user._id
    console.log('user id');
    console.log(userId);
    console.log('payment verify');
    console.log(req.body);
   let hmac = crypto.createHmac('sha256', '0sk7KMqW8V3HthmebsRFLx5A')
     hmac.update(req.body['payment[razorpay_order_id]']+'|'+ req.body['payment[razorpay_payment_id]'])
     hmac = hmac.digest('hex')  
     if(hmac === req.body['payment[razorpay_signature]']){
 console.log('payment order');
 

 const userCart = await cartModel.findOne({userId})
                if(userCart){
                const cartProductInfo = await Promise.all(
                  userCart.products.map(async (info)=>{
                    const product = await productModel.findOne({_id:info.productId})
                    let ProductCount = product.ProductCount
                        ProductCount -= info.quantity 
                        await productModel.findByIdAndUpdate({_id:info.productId},{$set:{ProductCount:ProductCount}},{new:true})
                  })
                ) 
                }
 
 
 await cartModel.updateOne({ userId }, { $unset: { products: 1 } });

 const order = await orderModel.findOneAndUpdate(
  { _id: id },
  { $set: {paymentStatus: 'Approved' } },

);
    console.log(order.paymentStatus);
    res.json({status:true})
     }else{
    
       res.json({status:false,errMsg:''})
     }
  }
};

module.exports = { paymentGateway };
