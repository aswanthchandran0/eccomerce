const productData = require('../models/productModel')
const orderData = require('../models/orderModel')
const AdminPanel = {
   adminPanel: async (req,res)=>{
    try{
        const products = await productData.find()
       const productExpense =  products.reduce((sum,product)=> sum + product.ProductExpense*product.ProductCount,0)
       const orders = await orderData.find()
       let cashOnDelivery = 0;
       let onlinePayment = 0;
       let latestcashOnDeliveryDate =null;
       let latesOnlinePaymentDate = null;
         orders.forEach((order)=>{
            if(order.paymentMethod === 'Cash on Delivery'){
                 cashOnDelivery += order.Total
                 if(!latestcashOnDeliveryDate || order.orderDate > latestcashOnDeliveryDate){
                    latestcashOnDeliveryDate = order.orderDate
                 }
            }
            else if(order.paymentMethod === 'Online Payment'){
                onlinePayment += order.Total
                if(!latesOnlinePaymentDate || order.orderDate > latesOnlinePaymentDate){
                    latesOnlinePaymentDate = order.orderDate
                }
            }


            
         })
        
        res.render('AdminPanel', {productExpense,cashOnDelivery,onlinePayment,latestcashOnDeliveryDate,latesOnlinePaymentDate})
    }catch(error){
        console.log(error);
        res.status(500).send('internal server error')
    }
           
   },
    logout : async(req,res)=>{
        try{
             await req.session.destroy() 
             res.redirect('/adminLogin');
        }catch(errors) {
            console.error('Error destroying session:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
}

module.exports = {AdminPanel}