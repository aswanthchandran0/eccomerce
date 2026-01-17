const orderData = require('../models/orderModel')
const userData = require('../models/userModel')
const  pdfkit = require('pdfkit')
const orderDetails = {

getOrderDetails: async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.session.user._id;
        
        const order = await orderData.findById(orderId)
            .populate({
                path: 'productDetails.productId',
                model: 'ProductDetails'
            })
            // If you have a coupon model, populate it too
            .populate('couponApplied.couponId');
            
        if (!order || order.userId !== userId) {
            return res.status(404).render('error', { 
                message: 'Order not found',
                user: req.session.user 
            });
        }
        
        res.render('profile/orderDetails', {
            user: req.session.user,
            currentPage: 'orders',
            order: order
        });
    } catch (error) {
        console.error('Order details error:', error);
        res.status(500).send('Internal server error');
    }
},

  orderPage: async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const orderId = req.query.id; // Get order ID from query parameter
        
        if (orderId) {
            // Fetch single order
            const order = await orderData.findById(orderId)
                .populate({
                    path: 'productDetails.productId',
                    model: 'ProductDetails'
                });
            
            if (!order || order.userId !== userId) {
                return res.status(404).send('Order not found');
            }
            
            return res.render('profile/orderDetails', { 
                user: req.session.user,
                order: order,
                currentPage: 'orders'
            });
        } else {
            // Original code for order list
            const page = parseInt(req.query.page) || 1;
            const totalOrder = await orderData.countDocuments({});
            const totalPages = Math.ceil(totalOrder/ORDER_PER_PAGE);
            const orderedProducts = await orderData
                .find({ userId: userId })
                .populate({
                    path: 'productDetails.productId',
                    model: 'ProductDetails',
                })
                .skip((page -1)*ORDER_PER_PAGE)
                .limit(ORDER_PER_PAGE);
            
            res.render('profile/orderDetails',{ 
                orderedProducts: orderedProducts,
                totalPages, 
                currentPage: page,
                user: req.session.user
            });
        }
    } catch(error){
        console.log(error);
        res.status(500).send('internal server error');
    }
},
   // In your orderDetailsController.js - update the deleteOrder function
deleteOrder: async(req,res)=>{
    try{
        const orderId = req.params.orderId
        const userId = req.session.user._id
        const reason = req.body.reason || 'Customer requested cancellation'
        
        // Find the order
        const order = await orderData.findById(orderId)
        
        // Check if order exists and belongs to user
        if (!order || order.userId !== userId) {
            return res.json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        // SIMPLE LOGIC: Can only cancel if order is not delivered
        // You can add more statuses if needed
        const canCancelStatuses = ['active', 'processing', 'pending']
        
        if (!canCancelStatuses.includes(order.orderStatus)) {
            return res.json({ 
                success: false, 
                error: `Cannot cancel order. Current status: ${order.orderStatus}` 
            });
        }
        
        // Update order status to cancelled
        await orderData.findByIdAndUpdate(
            orderId,
            { 
                orderStatus: 'cancelled',
                returnReason: reason,
                paymentStatus: order.paymentStatus === 'Approved' ? 'Refunded' : 'Cancelled'
            }
        );
        
        // If payment was made, refund to wallet
        if (order.paymentStatus === 'Approved') {
            if (order.paymentMethod === 'Online Payment' || order.paymentMethod === 'Wallet') {
                const user = await userData.findById(userId)
                const refundAmount = order.Total
                const updatedWallet = user.Wallet + refundAmount
                
                // Update user wallet
                await userData.findByIdAndUpdate(
                    userId,
                    { Wallet: updatedWallet }
                )
                
                // Add wallet transaction
                const creditedTransaction = {
                    status: 'credited',
                    amount: refundAmount, 
                    timestamp: new Date(),
                    description: `Refund for cancelled order ${orderId.slice(-6)}`
                }
                
                await userData.updateOne(
                    { _id: userId },
                    { $push: { walletStatus: creditedTransaction } }
                )
            }
        }
        
        console.log(`Order ${orderId} cancelled by user ${userId}`)
        
        res.json({
            success: true,
            message: 'Order cancelled successfully'
        })
        
    } catch(error){
        console.log('Cancellation error:', error)
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        })
    }
},
    orderedProductView: async(req,res)=>{
        try{
            const backButton = '/orderDetails'
            const orderId = req.query.orderId
           const orderInfo = await orderData.findById(orderId)
           .populate({
            path:'productDetails.productId',
            model:'ProductDetails'
           })
          res.render('orderedProductView',{orderInfo,backButton})
        }catch(error){
            console.log(error);
            res.status(500)
        }
    },
inVoice: async(req,res)=>{
    try{
       const orderId = req.query.orderId;
       const userId = req.session.user._id;
       
       // Get user and order data
       const user = await userData.findOne({_id: userId});
       const order = await orderData.findById(orderId)
           .populate({
            path:'productDetails.productId',
            model:'ProductDetails'
           });
       
       // Check if order belongs to user
       if (!order || order.userId !== userId) {
           return res.status(403).send('Unauthorized access');
       }
       
       console.log('Generating invoice for order:', orderId);
       
       // Render the invoice template
       res.render('invoice', {
           order: order,
           user: user,
           layout: false // Disable layout for clean invoice
       });
    } catch(error){
        console.log('Invoice error:', error);
        res.status(500).send('Error generating invoice');
    }
},

// Alternative: Generate PDF directly (if you want server-side PDF generation)
generatePDF: async(req,res)=>{
    try{
        const orderId = req.query.orderId;
        const userId = req.session.user._id;
        
        const user = await userData.findOne({_id: userId});
        const order = await orderData.findById(orderId)
            .populate({
                path:'productDetails.productId',
                model:'ProductDetails'
            });
        
        if (!order || order.userId !== userId) {
            return res.status(403).send('Unauthorized access');
        }
        
        // Create PDF using pdfkit (install: npm install pdfkit)
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId.slice(-6)}.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add content to PDF
        doc.fontSize(25).text('INVOICE', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Order ID: ${orderId}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Customer: ${user.Fname} ${user.Lname}`);
        doc.moveDown();
        
        // Add order items table
        let yPosition = 200;
        doc.fontSize(12).text('Items:', 50, yPosition);
        yPosition += 30;
        
        order.productDetails.forEach((item, index) => {
            const product = item.productId;
            doc.text(`${index + 1}. ${product ? product.name : 'Product'}`, 50, yPosition);
            doc.text(`Qty: ${item.purchasedCount}`, 300, yPosition);
            doc.text(`Price: ₹${product ? product.price : 0}`, 400, yPosition);
            yPosition += 20;
        });
        
        // Add totals
        yPosition += 20;
        doc.text(`Subtotal: ₹${order.Total - order.shippingPrice}`, 400, yPosition);
        yPosition += 20;
        doc.text(`Shipping: ₹${order.shippingPrice}`, 400, yPosition);
        yPosition += 20;
        doc.fontSize(14).text(`Total: ₹${order.Total}`, 400, yPosition, { bold: true });
        
        // Finalize PDF
        doc.end();
        
    } catch(error){
        console.log('PDF generation error:', error);
        res.status(500).send('Error generating PDF');
    }
}
   ,


requestReturn: async(req,res)=>{
    try{
        const orderId = req.params.orderId
        const userId = req.session.user._id
        const reason = req.body.reason || 'Customer requested return'
        
        const order = await orderData.findById(orderId)
        
        if (!order || order.userId !== userId) {
            return res.json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        // Only delivered orders can be returned
        if (order.orderStatus !== 'delivered') {
            return res.json({ 
                success: false, 
                error: 'Only delivered orders can be returned' 
            });
        }
        
        // Mark as returned
        await orderData.findByIdAndUpdate(
            orderId,
            { 
                orderStatus: 'returned',
                returnReason: reason,
                paymentStatus: 'Refunded'
            }
        );
        
        // Refund to wallet
        if (order.paymentMethod === 'Online Payment' || order.paymentMethod === 'Wallet') {
            const user = await userData.findById(userId)
            const refundAmount = order.Total
            const updatedWallet = user.Wallet + refundAmount
            
            await userData.findByIdAndUpdate(
                userId,
                { Wallet: updatedWallet }
            )
            
            const creditedTransaction = {
                status: 'credited',
                amount: refundAmount, 
                timestamp: new Date(),
                description: `Refund for returned order ${orderId.slice(-6)}`
            }
            
            await userData.updateOne(
                { _id: userId },
                { $push: { walletStatus: creditedTransaction } }
            )
        }
        
        res.json({
            success: true,
            message: 'Return request processed successfully'
        })
        
    } catch(error){
        console.log('Return error:', error)
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        })
    }
}

}





module.exports = {orderDetails}


