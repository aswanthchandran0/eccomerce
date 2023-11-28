const productData = require('../models/productModel')
const orderData = require('../models/orderModel')
const ProductDetails = require('../models/productModel')
const order = require('../models/orderModel')
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
         const today = new Date();
      today.setHours(0, 0, 0, 0);


           const todayOrders = await orderData.find({
    orderDate: { $gte: today },
    paymentStatus: 'Approved'
});
        const todayIncome = todayOrders.reduce((sum,product)=> product.Total+sum,0)
        
        const yearlyOrders = await orderData.find({
            orderDate: {
                $gte: new Date(today.getFullYear(), 0, 1),
                $lt: new Date(today.getFullYear() + 1, 0, 1)
            },
            paymentStatus: 'Approved'
        });

        const yearlyIncome = yearlyOrders.reduce((sum,order)=> order.Total+sum,0)

        const monthlyOrder = await orderData.find({
            orderDate: {
                $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
            },
            paymentStatus: 'Approved'
        })

        const monthlyIncome = monthlyOrder.reduce((sum,order)=> order.Total + sum,0)

        // most selled products

        const mostSoldProductDetails = await order.aggregate([
            {
              $unwind: "$productDetails"
            },
            {
              $group: {
                _id: "$productDetails.productId",
                count: { $sum: "$productDetails.purchasedCount" },
              }
            },
            {
              $sort: { count: -1 }
            },
            {
              $limit: 5
            }
          ]);

          const mostSoldProducts = await Promise.all(mostSoldProductDetails.map(async (info) => {
            const productInfo = await ProductDetails.findById({ _id: info._id });
            return {
              product: productInfo,
              count: info.count
            };
          }));

        
        
          
          console.log('Most Sold Product details:', mostSoldProductDetails);
          console.log('most sold product',mostSoldProducts);
        res.render('AdminPanel', {productExpense,cashOnDelivery,onlinePayment,latestcashOnDeliveryDate,latesOnlinePaymentDate,todayIncome,monthlyIncome,yearlyIncome,mostSoldProducts})
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