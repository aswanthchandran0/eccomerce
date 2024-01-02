const orderDetails = require('../models/orderModel')

sales = {
    loadPage: async(req,res)=>{
        const REPORT_PER_PAGE = 10
        try{
           const page = parseInt(req.query.page) ||1
           const TotalReport = await orderDetails.countDocuments({})
           const totalPages = Math.ceil(TotalReport/REPORT_PER_PAGE)
           const orderData = await orderDetails.find({})
           .skip((page-1)*REPORT_PER_PAGE)
           .limit(REPORT_PER_PAGE)
                   console.log('order data',orderData);
                   const order = await orderDetails.find({})
                   const totalPrice = order.reduce((sum,order)=> sum+order.Total,0)
                  
            res.render('salesReport',{totalPages,currentPage:page,orderData:orderData?orderData:'',totalPrice:totalPrice?totalPrice:''}) 
        }catch(error){
            console.log(error);
            res.status(500)
        }
    },
    filter: async(req,res)=>{
        try{
            const value = req.query.value
            let startDate,endDate
    
            if (value === 'all') {
                // Show all orders
            } else if (value === 'Day') {
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
    
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
            } else if (value === 'Month') {
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
    
                endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
            } else if (value === 'year') {
                startDate = new Date();
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
    
                endDate = new Date();
                endDate.setMonth(11, 31);
                endDate.setHours(23, 59, 59, 999);
            }
            const filter = value === 'all' ? {} : { orderDate: { $gte: startDate, $lte: endDate } };
            const filteredOrders = await orderDetails.find(filter);  
            const totalPrice = filteredOrders.reduce((sum, order) => sum + order.Total, 0);
                     res.json({filteredOrders,totalPrice})
            
        }catch(error){
            console.log(error);
            res.status(500)
        }  
    }
}

module.exports = {sales}