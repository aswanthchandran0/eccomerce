const orderDetails = require('../models/orderModel');

const sales = {
    loadPage: async (req, res) => {
        const REPORT_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page) || 1;
            const TotalReport = await orderDetails.countDocuments({});
            const totalPages = Math.ceil(TotalReport / REPORT_PER_PAGE);
            
            const orderData = await orderDetails.find({})
                .sort({ orderDate: -1 })
                .skip((page - 1) * REPORT_PER_PAGE)
                .limit(REPORT_PER_PAGE);
            
            const allOrders = await orderDetails.find({});
            const totalPrice = allOrders.reduce((sum, order) => sum + order.Total, 0);
            
            res.render('salesReport', {
                totalPages,
                currentPage: page,
                orderData: orderData || [],
                totalPrice: totalPrice || 0
            });
        } catch (error) {
            console.error('Sales report page error:', error);
            res.status(500).render('error', { message: 'Error loading sales report' });
        }
    },

    filter: async (req, res) => {
        try {
            const { value, start, end } = req.query;
            let filter = {};
            
            if (value === 'custom' && start && end) {
                // Custom date range
                const startDate = new Date(start);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(end);
                endDate.setHours(23, 59, 59, 999);
                
                filter = { orderDate: { $gte: startDate, $lte: endDate } };
            } else if (value === 'Day') {
                const startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                
                filter = { orderDate: { $gte: startDate, $lte: endDate } };
            } else if (value === 'Month') {
                const startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                
                filter = { orderDate: { $gte: startDate, $lte: endDate } };
            } else if (value === 'year') {
                const startDate = new Date();
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date();
                endDate.setMonth(11, 31);
                endDate.setHours(23, 59, 59, 999);
                
                filter = { orderDate: { $gte: startDate, $lte: endDate } };
            }
            // For 'all', filter remains empty
            
            const filteredOrders = await orderDetails.find(filter).sort({ orderDate: -1 });
            const totalPrice = filteredOrders.reduce((sum, order) => sum + order.Total, 0);
            
            res.json({
                filteredOrders,
                totalPrice,
                stats: {
                    totalOrders: filteredOrders.length,
                    totalRevenue: totalPrice,
                    avgOrderValue: filteredOrders.length > 0 ? Math.round(totalPrice / filteredOrders.length) : 0,
                    deliveredOrders: filteredOrders.filter(o => o.orderStatus === 'delivered').length
                }
            });
        } catch (error) {
            console.error('Sales filter error:', error);
            res.status(500).json({ error: 'Error filtering sales data' });
        }
    }
};

module.exports = { sales };