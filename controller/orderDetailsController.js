const orderData = require('../models/orderModel')
const userData = require('../models/userModel')
const orderDetails = {
    orderPage: async(req,res)=>{
        try{
            const userId = req.session.user._id

            const orderedProducts = await orderData
            .find({ userId: userId })
            .populate({
                path: 'productDetails.productId',
                model: 'ProductDetails',
            });
          
                  console.log('orderedProducts',orderedProducts);

            res.render('orderDetails',{ orderedProducts: orderedProducts})
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
          
      const updatedOrder =  await orderData.findOneAndUpdate(
                { _id:orderId },
                { $set: { orderStatus: 'canceled' } },
                { new: true }
            );
      if(updatedOrder.paymentMethod === 'Online Payment' &&  updatedOrder.orderStatus === 'canceled'){
          const user = await userData.findById(userId)
            const wallet = user.Wallet
            const updatedMoney = updatedOrder.Total
            const updatedWallet = wallet+updatedMoney

            const creditedTransaction = {status:'credited',amount: updatedMoney, timestamp: new Date()}
            await userData.updateOne(
                { _id: userId },
                { $push: { walletStatus: creditedTransaction } }
              );
              await userData.findByIdAndUpdate(userId,{Wallet:updatedWallet},{new:true}) 

            await orderData.findByIdAndUpdate(orderId,{Total:0,paymentStatus:'Returned'},{new:true})
            
        console.log('user',user);
      } else if(updatedOrder.paymentMethod === 'Wallet' &&  updatedOrder.orderStatus === 'canceled'){
        const user = await userData.findById(userId)
        const wallet = user.Wallet
        const updatedMoney = updatedOrder.Total
        const updatedWallet = wallet+updatedMoney
        const creditedTransaction = {status:'credited',amount: updatedMoney, timestamp: new Date()}
        await userData.updateOne(
            { _id: userId },
            { $push: { walletStatus: creditedTransaction } }
          );
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


