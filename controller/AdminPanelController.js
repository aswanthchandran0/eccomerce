const productData = require('../models/productModel')
const orderData = require('../models/orderModel')
const ProductDetails = require('../models/productModel')
const order = require('../models/orderModel')
const AdminPanel = {
   adminPanel: async (req,res)=>{
    try{
        const products = await productData.find()
      
       const productExpense =  products.reduce((sum,product)=> sum + product.ProductExpense*product.ProductCount,0)

       const walletPayment = await orderData.aggregate([
        {
            $match: { paymentMethod: 'Wallet', paymentStatus: 'Approved' }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$Total' }
            }
        }
    ]);

    const totalCashOnDeliveryPayment = await orderData.aggregate([
        {
            $match: { paymentMethod: 'Cash on Delivery', paymentStatus: 'Approved' }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$Total' }
            }
        }
    ]);

    const totalOnlinePayment = await orderData.aggregate([
        {
            $match: { paymentMethod: 'Online Payment', paymentStatus: 'Approved' }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$Total' }
            }
        }
    ]);

    const cashOnDeliveryTotal = totalCashOnDeliveryPayment.length > 0 ? totalCashOnDeliveryPayment[0].total : 0;
    const walletTotal = walletPayment.length > 0 ? walletPayment[0].total : 0;
    const onlinePaymentTotal = totalOnlinePayment.length > 0 ? totalOnlinePayment[0].total : 0;
      
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

        
        
          
         
          if(!mostSoldProducts || mostSoldProducts.length ===0){
         return    res.render('AdminPanel', {productExpense,cashOnDelivery,onlinePayment,latestcashOnDeliveryDate,latesOnlinePaymentDate,todayIncome,monthlyIncome,yearlyIncome,mostSoldProducts:'',cashOnDeliveryTotal,walletTotal,onlinePaymentTotal})
          }
        res.render('AdminPanel', {productExpense,cashOnDelivery,onlinePayment,latestcashOnDeliveryDate,latesOnlinePaymentDate,todayIncome,monthlyIncome,yearlyIncome,mostSoldProducts,cashOnDeliveryTotal,walletTotal,onlinePaymentTotal})
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