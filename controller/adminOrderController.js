const  orderDetails = require('../models/orderModel')

const orderStatus ={
    orderStatusPage: async(req,res)=>{
        try{
            const orderData = await orderDetails.find()
      console.log(orderData);
             res.render('adminOrder',{orderData:orderData})
        }catch(error){
            console.log(error)
            res.status(500).send('internal server error')
        }
    }
}


module.exports = {orderStatus}