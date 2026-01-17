const orderDetails = require('../models/orderModel');
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const moment = require('moment');

// Add this helper function BEFORE the controller object
function getStatusClass(status) {
    const classes = {
        'active': 'btn-success',
        'processing': 'btn-info',
        'shipped': 'btn-primary',
        'delivered': 'btn-success',
        'cancelled': 'btn-danger',
        'returned': 'btn-warning'
    };
    return classes[status] || 'btn-secondary';
}

// Helper function to get allowed next statuses
function getNextAllowedStatuses(currentStatus) {
    const statusFlow = {
        'active': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': ['returned'],
        'cancelled': [], // Cannot change from cancelled
        'returned': []   // Cannot change from returned
    };
    
    return statusFlow[currentStatus] || [];
}

// Helper function to refund order
async function refundOrder(order, orderId, reason) {
    try {
        const user = await userModel.findById(order.userId);
        if (user) {
            const refundAmount = order.Total;
            const updatedWallet = user.Wallet + refundAmount;
            
            await userModel.findByIdAndUpdate(
                order.userId,
                { Wallet: updatedWallet }
            );
            
            // Add wallet transaction
            const creditedTransaction = {
                status: 'credited',
                amount: refundAmount,
                timestamp: new Date(),
                description: `Refund for ${reason} order ${orderId.toString().slice(-6)}`
            };
            
            await userModel.updateOne(
                { _id: order.userId },
                { $push: { walletStatus: creditedTransaction } }
            );
        }
    } catch (error) {
        console.error(`Refund error for order ${orderId}:`, error);
        // Don't fail the whole operation if refund fails
    }
}

const orderStatus = {
    orderStatusPage: async (req, res) => {
        const ORDERS_PER_PAGE = 10;
        try {
            const page = parseInt(req.query.page) || 1;
            const searchQuery = req.query.search || '';
            const statusFilter = req.query.status || 'all';
            
            // Build filter object
            let filter = {};
            
            // Search filter (by order ID or user ID)
            if (searchQuery) {
                // Check if search query looks like an ObjectId
                if (mongoose.Types.ObjectId.isValid(searchQuery)) {
                    filter._id = searchQuery;
                } else {
                    filter = {
                        $or: [
                            { userId: { $regex: searchQuery, $options: 'i' } },
                            { 'address.Fname': { $regex: searchQuery, $options: 'i' } },
                            { 'address.Email': { $regex: searchQuery, $options: 'i' } },
                            { 'couponApplied.couponCode': { $regex: searchQuery, $options: 'i' } },
                            { paymentMethod: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                }
            }
            
            // Status filter
            if (statusFilter !== 'all') {
                filter.orderStatus = statusFilter;
            }
            
            // Get total count for pagination
            const totalOrder = await orderDetails.countDocuments(filter);
            const totalPages = Math.ceil(totalOrder / ORDERS_PER_PAGE);
            
            // Get orders with pagination and population
            const orderData = await orderDetails.find(filter)
                .sort({ orderDate: -1 })
                .skip((page - 1) * ORDERS_PER_PAGE)
                .limit(ORDERS_PER_PAGE)
                .populate({
                    path: 'productDetails.productId',
                    model: 'ProductDetails',
                    select: 'name price images'
                })
                .lean();
            
            // Format order data for better display
            const formattedOrders = orderData.map(order => {
                // Calculate total items
                const totalItems = order.productDetails.reduce((sum, item) => {
                    return sum + (item.purchasedCount || 0);
                }, 0);
                
                // Get user name from order address
                const userName = order.address?.Fname || 'Unknown';
                
                // Determine which statuses are allowed for this order
                const allowedNextStatuses = getNextAllowedStatuses(order.orderStatus);
                
                // Determine status class for Bootstrap styling
                const statusClass = getStatusClass(order.orderStatus);
                
                return {
                    _id: order._id,
                    orderId: order._id.toString().slice(-6).toUpperCase(),
                    userId: order.userId,
                    userName: userName,
                    orderDate: order.orderDate,
                    formattedDate: moment(order.orderDate).format('MMM D, YYYY'),
                    formattedTime: moment(order.orderDate).format('hh:mm A'),
                    totalAmount: order.Total,
                    shippingPrice: order.shippingPrice || 0,
                    orderStatus: order.orderStatus,
                    paymentStatus: order.paymentStatus,
                    paymentMethod: order.paymentMethod,
                    totalItems: totalItems,
                    products: order.productDetails.map(item => ({
                        name: item.productId?.name || 'Product Not Found',
                        quantity: item.purchasedCount,
                        price: item.productId?.price || 0
                    })),
                    address: order.address,
                    couponApplied: order.couponApplied || null,
                    allowedNextStatuses: allowedNextStatuses,
                    statusClass: statusClass, // NEW: Pre-computed CSS class
                    canBeDeleted: ['cancelled', 'returned'].includes(order.orderStatus)
                };
            });
            
            // Get order statistics
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const stats = {
                totalOrders: await orderDetails.countDocuments({}),
                todayOrders: await orderDetails.countDocuments({
                    orderDate: { $gte: today, $lt: tomorrow }
                }),
                pendingOrders: await orderDetails.countDocuments({ 
                    orderStatus: { $in: ['active', 'processing'] } 
                }),
                totalRevenue: await orderDetails.aggregate([
                    { $match: { orderStatus: 'delivered' } },
                    { $group: { _id: null, total: { $sum: '$Total' } } }
                ]).then(result => result[0]?.total || 0)
            };
            
            res.render('adminOrder', {
                orderData: formattedOrders,
                totalPages,
                currentPage: page,
                totalOrder,
                searchQuery,
                statusFilter,
                stats: stats,
                currentPageName: 'Orders'
            });
            
        } catch (error) {
            console.error('Order page error:', error);
            // Fix the error rendering - use a simple error response
            res.status(500).send(`Error loading orders: ${error.message}`);
        }
    },


    updateOrderStatus: async (req, res) => {
    try {
        console.log('Received update request:', req.body);
        
        const { orderId, newStatus, reason } = req.body;
        
        // Validate inputs
        if (!orderId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and status are required'
            });
        }
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Order ID'
            });
        }
        
        // Allowed statuses
        const allowedStatuses = ['active', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
        
        if (!allowedStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }
        
        // Find the order
        const order = await orderDetails.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        console.log('Current order status:', order.orderStatus);
        
        // Check if transition is allowed
        const allowedTransitions = getNextAllowedStatuses(order.orderStatus);
        console.log('Allowed transitions:', allowedTransitions);
        
        if (!allowedTransitions.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.orderStatus} to ${newStatus}. Allowed next statuses: ${allowedTransitions.join(', ')}`
            });
        }
        
        // Prepare update data
        const updateData = {
            orderStatus: newStatus,
            updatedAt: new Date()
        };
        
        // Auto-update payment status based on order status
        if (newStatus === 'delivered') {
            updateData.paymentStatus = 'Approved';
        } else if (newStatus === 'cancelled') {
            updateData.paymentStatus = order.paymentStatus === 'Approved' ? 'Refunded' : 'Cancelled';
            updateData.returnReason = reason || 'Cancelled by admin';
            
            // If order is cancelled and payment was approved, refund to user's wallet
            if (order.paymentStatus === 'Approved') {
                if (order.paymentMethod === 'Online Payment' || order.paymentMethod === 'Wallet') {
                    await refundOrder(order, orderId, 'cancelled');
                }
            }
        } else if (newStatus === 'returned') {
            updateData.paymentStatus = 'Refunded';
            updateData.returnReason = reason || 'Returned by customer';
            
            // Refund for returned orders
            if (order.paymentStatus === 'Approved') {
                if (order.paymentMethod === 'Online Payment' || order.paymentMethod === 'Wallet') {
                    await refundOrder(order, orderId, 'returned');
                }
            }
        }
        
        console.log('Update data:', updateData);
        
        // Update order status
        const updatedOrder = await orderDetails.findByIdAndUpdate(
            orderId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        console.log('Updated order:', updatedOrder);
        
        res.json({
            success: true,
            message: `Order status updated to ${newStatus}`,
            order: {
                id: updatedOrder._id,
                status: updatedOrder.orderStatus,
                paymentStatus: updatedOrder.paymentStatus,
                allowedNextStatuses: getNextAllowedStatuses(updatedOrder.orderStatus),
                statusClass: getStatusClass(updatedOrder.orderStatus),
                canBeDeleted: false // Since you don't want delete option
            }
        });
        
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
},

    adminProductView: async (req, res) => {
        try {
            const orderId = req.query.orderId;
            
            if (!orderId) {
                return res.status(400).send('Order ID is required');
            }
            
            const orderInfo = await orderDetails.findById(orderId)
                .populate({
                    path: 'productDetails.productId',
                    model: 'ProductDetails',
                    select: 'name price images category brand'
                })
                .lean();
            
            if (!orderInfo) {
                return res.status(404).send('Order not found');
            }
            
            // Calculate additional information
            const totalItems = orderInfo.productDetails.reduce((sum, item) => {
                return sum + (item.purchasedCount || 0);
            }, 0);
            
            const subtotal = orderInfo.productDetails.reduce((sum, item) => {
                const price = item.productId?.price || 0;
                return sum + (price * item.purchasedCount);
            }, 0);
            
            // Format dates
            orderInfo.formattedDate = moment(orderInfo.orderDate).format('MMMM D, YYYY');
            orderInfo.formattedTime = moment(orderInfo.orderDate).format('hh:mm A');
            
            res.render('orderedProductView', {
                orderInfo: orderInfo,
                totalItems: totalItems,
                subtotal: subtotal,
                backButton: 'adminOrder',
                currentPageName: 'Order Details'
            });
            
        } catch (error) {
            console.error('Admin product view error:', error);
            res.status(500).send(`Failed to load order details: ${error.message}`);
        }
    },

    // Get order statistics
    getOrderStats: async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const stats = {
                total: await orderDetails.countDocuments({}),
                today: await orderDetails.countDocuments({
                    orderDate: { $gte: today, $lt: tomorrow }
                }),
                pending: await orderDetails.countDocuments({ 
                    orderStatus: { $in: ['active', 'processing'] } 
                }),
                revenue: await orderDetails.aggregate([
                    { $match: { orderStatus: 'delivered' } },
                    { $group: { _id: null, total: { $sum: '$Total' } } }
                ]).then(result => result[0]?.total || 0)
            };
            
            res.json({ success: true, stats });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Delete order (with validations)
    deleteOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            
            // Validate order exists
            const order = await orderDetails.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
            // Only allow deletion of cancelled or returned orders
            if (!['cancelled', 'returned'].includes(order.orderStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Only cancelled or returned orders can be deleted'
                });
            }
            
            // Check if order is old enough to delete (e.g., 30 days old)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            if (order.orderDate > thirtyDaysAgo) {
                return res.status(400).json({
                    success: false,
                    message: 'Orders can only be deleted 30 days after creation'
                });
            }
            
            await orderDetails.findByIdAndDelete(orderId);
            
            res.json({
                success: true,
                message: 'Order deleted successfully'
            });
            
        } catch (error) {
            console.error('Delete order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete order',
                error: error.message
            });
        }
    },

    // Get order details for modal/view
    getOrderDetails: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }
            
            const order = await orderDetails.findById(orderId)
                .populate({
                    path: 'productDetails.productId',
                    model: 'ProductDetails',
                    select: 'name price images category brand'
                })
                .lean();
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
            // Format the data
            const totalItems = order.productDetails.reduce((sum, item) => {
                return sum + (item.purchasedCount || 0);
            }, 0);
            
            const subtotal = order.productDetails.reduce((sum, item) => {
                const price = item.productId?.price || 0;
                return sum + (price * item.purchasedCount);
            }, 0);
            
            res.json({
                success: true,
                order: {
                    ...order,
                    totalItems: totalItems,
                    subtotal: subtotal,
                    formattedDate: moment(order.orderDate).format('MMMM D, YYYY hh:mm A'),
                    userName: order.address?.Fname || 'Unknown'
                }
            });
            
        } catch (error) {
            console.error('Get order details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load order details',
                error: error.message
            });
        }
    }
};

module.exports = { orderStatus };