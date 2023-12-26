const  orderDetails = require('../models/orderModel')

const orderStatus ={
    orderStatusPage: async(req,res)=>{
      const ORDERS_PER_PAGE = 10
        try{
          const page = parseInt(req.query.page) || 1
          const totalOrder = await orderDetails.countDocuments({})
          const totalPages = Math.ceil(totalOrder/ORDERS_PER_PAGE)
            const orderData = await orderDetails.find().sort({ orderDate:'desc'})
            .skip((page-1)*ORDERS_PER_PAGE)
            .limit(ORDERS_PER_PAGE)
            .exec();
      console.log(orderData);
             res.render('adminOrder',{orderData:orderData,totalPages,currentPage:page})
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
    res.json({sucess:true})
      }catch(error){
        console.log(error);
        res.status(500).send('internal server error')
      }
    }
}


module.exports = {orderStatus}