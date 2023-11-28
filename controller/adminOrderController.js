const  orderDetails = require('../models/orderModel')

const orderStatus ={
    orderStatusPage: async(req,res)=>{
        try{
            const orderData = await orderDetails.find().sort({ orderDate:'desc'})
      console.log(orderData);
             res.render('adminOrder',{orderData:orderData})
        }catch(error){
            console.log(error)
            res.status(500).send('internal server error')
        }
    },
    updateOrderStatus: async(req,res)=>{
      try{
        const orderId = req.params.orderId
       const NewOrderStatus = req.params.selectedValue
 const data =     await orderDetails.findOneAndUpdate({_id:orderId},{$set:{ orderStatus:NewOrderStatus}},{new:true})
 if(NewOrderStatus == 'Deliverd'){
  await orderDetails.findOneAndUpdate({_id:orderId},{$set:{paymentStatus:'Approved'}},{new:true})
 }
      console.log('order status sucessfully',data);
    res.json({sucess:true})
      }catch(error){
        console.log(error);
        res.status(500).send('internal server error')
      }
    }
}


module.exports = {orderStatus}