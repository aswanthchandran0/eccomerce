const orderData = require('../models/orderModel')
const userData = require('../models/userModel')
const orderDetails = {
    orderPage: async(req,res)=>{
        try{
            const userId = req.session.user._id
            const orderedProducts = await orderData.find({userId:userId})

            res.render('orderDetails',{ orderedProducts: orderedProducts })
        }catch(error){
             console.log(error);
             res.status(500).send('internal server error')
        }
       
    },
    deleteOrder: async(req,res)=>{
        try{
            const orderId = req.params.orderId
            const orderStatus = req.query.orderStatus
            const userId = req.session.user._id
            // if(orderStatus === 'Delivered'){
            //     const userOrder = await orderData.findById(orderId)
            //     const shippingPrice = userOrder.shippingPrice
            //     const TotalPrice = userOrder.Total
            //     const updatedPrice = TotalPrice-shippingPrice
            //     console.log('shipping price',shippingPrice);
            //     console.log('total price',TotalPrice);
            //     console.log('updated price',updatedPrice);
            //     const user = await userData.findByIdAndUpdate(userId,{Wallet:updatedPrice},{new:true})
            //     res.json({sucess:true})
            // }
      const updatedOrder =  await orderData.findOneAndUpdate(
                { _id:orderId },
                { $set: { orderStatus: 'canceled' } },
                { new: true }
            );
      if(updatedOrder.paymentMethod === 'Online Payment' &&  updatedOrder.orderStatus === 'canceled'){
          const user = await userData.findById(userId)
            const wallet = user.Wallet
            const updatedWallet = wallet+updatedOrder.Total
            await userData.findByIdAndUpdate(userId,{Wallet:updatedWallet},{new:true})
            await orderData.findByIdAndUpdate(orderId,{Total:0,paymentStatus:'Returned'},{new:true})
        
      }
            console.log('orderstatus',updatedOrder.orderStatus);

        res.json({sucess:true})
        }catch(error){
            console.log(error)
            res.status(500).send('internal server error')
        }
        

    }
}





module.exports = {orderDetails}


    








//               const userId = req.session.user._id;
           
//               const orderDetails = await orderData.find({userId:userId})
//               const productIds = orderDetails.map(order => order.productId).flat();
//               const productDetails = await productModel.find({ _id: { $in: productIds } });
//               console.log('product details'+productDetails);
// console.log('order details'+orderDetails);
//               const userAddress = await AddressModel.findOne({ user: userId });
//              // res.render('userProfile',{ user: req.session.user, ValidationErr:req.session.validationErr,userdata: userAddress,orderDetails,productDetails})
    
 
//   res.render('orderDetails',orderDetails,productDetails,userAddress);