const addressModel = require('../models/userAddressModel');
const cartModel = require('../models/cartModel');
const product = require('../models/productModel');
const orderModel = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const CouponUsage = require('../models/couponUsageModel');
const RazorPay = require('../paymentGateway/RazorPay');
const productModel = require('../models/productModel');
const userData = require('../models/userModel');
const moment = require('moment');


const order = {

  orderPage: async (req, res) => {
    try {
      const userId = req.session.user._id;
      
      // Get user wallet balance
      const user = await userData.findById(userId);
      const walletBalance = user ? user.Wallet || 0 : 0;
      
      // Get user address
      const address = await addressModel.findOne({ user: userId });
      
      // Get user cart
      const userCart = await cartModel.findOne({ userId });

      if (!userCart || userCart.products.length === 0) {
        return res.render("orderPage", {
          address: address || "",
          products: [],
          totalPrice: 0,
          individualTotalArray: [],
          totalPriceArray: [],
          shippingPrice: 0,
          allTotal: 0,
          discountError: req.session.discountError || null,
          discountAmount: req.session.discountAmount || 0,
          discountPercentage: req.session.discountPercentage || 0,
          couponCode: req.session.couponCode || '',
          currentPage: "checkout",
          discountSuccess: req.session.discountSuccess || false,
          walletBalance: walletBalance,
          user: req.session.user
        });
      }

      const productDetails = userCart.products.map((product) => ({
        productId: product.productId,
        purchasedCount: product.quantity,
      }));

      const products = await product.find({
        _id: { $in: productDetails.map((p) => p.productId) },
      });

      const totalPriceArray = [];
      const individualTotalArray = [];

      let subTotal = 0;
      for (let i = 0; i < products.length; i++) {
        const itemTotal = products[i].price * productDetails[i].purchasedCount;
        subTotal += itemTotal;
        individualTotalArray.push(itemTotal);
        totalPriceArray.push(subTotal);
      }

      // Calculate discount from session
      const discountAmount = req.session.discountAmount || 0;
      let totalPrice = subTotal - discountAmount;
      const shippingPrice = userCart.shippingPrice || 0;
      const allTotal = totalPrice + shippingPrice;

      res.render("orderPage", {
        address: address || "",
        products,
        totalPrice,
        individualTotalArray,
        totalPriceArray,
        shippingPrice,
        allTotal,
        discountError: req.session.discountError || null,
        discountAmount: discountAmount,
        discountPercentage: req.session.discountPercentage || 0,
        couponCode: req.session.couponCode || '',
        currentPage: "checkout",
        discountSuccess: req.session.discountSuccess || false,
        walletBalance: walletBalance,
        user: req.session.user
      });
    } catch (error) {
      console.error('Order page error:', error);
      res.status(500).send("Internal server error");
    }
  },

  applyCoupon: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const couponCode = req.body.couponCode?.trim().toUpperCase();
      
      if (!couponCode) {
        return res.json({ 
          success: false,
          error: "Please enter a coupon code" 
        });
      }

      // Find the coupon
      const coupon = await Coupon.findOne({ couponCode });
      
      if (!coupon) {
        return res.json({ 
          success: false,
          error: "Invalid coupon code" 
        });
      }

      // Check if coupon is valid
      if (!coupon.isActive) {
        return res.json({ 
          success: false,
          error: "Coupon is inactive" 
        });
      }

      if (coupon.isExpired) {
        return res.json({ 
          success: false,
          error: "Coupon has expired" 
        });
      }

      // Check if user has reached usage limit for this coupon
      const userUsageCount = await CouponUsage.countDocuments({
        userId: userId,
        couponId: coupon._id
      });

      if (coupon.userLimit && userUsageCount >= coupon.userLimit) {
        return res.json({ 
          success: false,
          error: "You have already used this coupon" 
        });
      }

      // Check if coupon has reached global usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.json({ 
          success: false,
          error: "Coupon usage limit reached" 
        });
      }

      // Get cart total
      const userCart = await cartModel.findOne({ userId }).populate("products.productId");
      if (!userCart || userCart.products.length === 0) {
        return res.json({ 
          success: false,
          error: "Cart is empty" 
        });
      }

      let subTotal = 0;
      userCart.products.forEach(item => {
        const price = parseFloat(item.productId?.price?.toString() || "0");
        const qty = item.quantity || 0;
        subTotal += price * qty;
      });

      const shippingPrice = userCart.shippingPrice || 0;
      const orderAmount = subTotal + shippingPrice;

      // Check minimum order amount
      if (orderAmount < coupon.minOrderAmount) {
        return res.json({ 
          success: false,
          error: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
        });
      }

      // Calculate discount
      const discountAmount = coupon.calculateDiscount(orderAmount);
      
      if (discountAmount <= 0) {
        return res.json({ 
          success: false,
          error: "Coupon not applicable to this order" 
        });
      }

      // Store coupon details in session
      req.session.couponCode = couponCode;
      req.session.couponId = coupon._id.toString();
      req.session.discountPercentage = coupon.discountPercentage;
      req.session.discountAmount = discountAmount;
      req.session.discountSuccess = true;
      req.session.discountError = null;

      console.log(`Coupon applied: ${couponCode}, Discount: ${discountAmount}`);

      return res.json({ 
        success: true,
        couponCode: couponCode,
        discountAmount: discountAmount,
        discountPercentage: coupon.discountPercentage,
        message: "Coupon applied successfully"
      });
      
    } catch (error) {
      console.error("Coupon application error:", error);
      return res.json({ 
        success: false,
        error: "Error applying coupon" 
      });
    }
  },

  removeCoupon: async (req, res) => {
    try {
      // Clear coupon from session
      delete req.session.couponCode;
      delete req.session.couponId;
      delete req.session.discountPercentage;
      delete req.session.discountAmount;
      delete req.session.discountSuccess;
      delete req.session.discountError;
      
      return res.json({ 
        success: true,
        message: "Coupon removed successfully" 
      });
    } catch (error) {
      console.error("Remove coupon error:", error);
      return res.json({ 
        success: false,
        error: "Error removing coupon" 
      });
    }
  },

  order: async (req, res) => {
    try {
      console.log('Order request received:', req.body);
      
      const userId = req.session.user._id;
      const { 
        selectedAddressId, 
        selectedPaymentMethod,
      } = req.body;
      
      // Get coupon details from session
      const couponCode = req.session.couponCode;
      const couponId = req.session.couponId;
      const discountPercentage = req.session.discountPercentage || 0;
      const discountAmount = req.session.discountAmount || 0;
      
      console.log('Processing order with:', {
        userId,
        selectedAddressId,
        selectedPaymentMethod,
        couponCode,
        discountAmount
      });

      // Validate required fields
      if (!selectedAddressId) {
        return res.status(400).json({ 
          success: false,
          error: "Address is required" 
        });
      }
      
      if (!selectedPaymentMethod) {
        return res.status(400).json({ 
          success: false,
          error: "Payment method is required" 
        });
      }

      // Find address
      const userAddress = await addressModel.findOne(
        { user: userId, "address._id": selectedAddressId },
        { "address.$": 1 }
      );
      if (!userAddress || !userAddress.address || userAddress.address.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid address" 
        });
      }

      // Find cart
      const userCart = await cartModel.findOne({ userId }).populate('products.productId');
      if (!userCart || userCart.products.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: "Cart is empty" 
        });
      }

      // Calculate total price
      let subTotal = 0;
      for (let i = 0; i < userCart.products.length; i++) {
        const item = userCart.products[i];
        const price = parseFloat(item.productId?.price?.toString() || "0");
        const qty = item.quantity || 0;
        const itemTotal = price * qty;
        subTotal += itemTotal;
      }

      const shippingPrice = userCart.shippingPrice || 0;
      let totalPrice = subTotal + shippingPrice - discountAmount;
      totalPrice = Number(totalPrice.toFixed(2));
      
      if (totalPrice <= 0) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid total price" 
        });
      }

      const daddress = { ...userAddress.address[0] };

      // Create product details array
      const productDetails = userCart.products.map(item => ({
        productId: item.productId._id,
        purchasedCount: item.quantity,
        price: parseFloat(item.productId?.price?.toString() || "0")
      }));

      // FIXED: Set ALL orders to "active" status initially
      const orderStatus = 'active';
      
      // Create new order
      const newOrder = new orderModel({
        userId,
        productDetails,
        address: daddress,
        shippingPrice: shippingPrice,
        Total: totalPrice,
        paymentMethod: selectedPaymentMethod,
        orderDate: new Date(),
        paymentStatus: selectedPaymentMethod === 'Cash on Delivery' ? 'Pending' : 
                      selectedPaymentMethod === 'Wallet' ? 'Approved' : 'Pending',
        orderStatus: orderStatus, // Set ALL orders to 'active'
        // Add coupon details to order
        couponApplied: couponCode ? {
          couponCode: couponCode,
          discountPercentage: discountPercentage,
          discountAmount: discountAmount,
          couponId: couponId
        } : null
      });

      await newOrder.save();
      const orderId = newOrder._id;

      // Record coupon usage if coupon was applied
      if (couponCode && couponId) {
        try {
          const couponUsage = new CouponUsage({
            couponId: couponId,
            userId: userId,
            orderId: orderId,
            couponCode: couponCode,
            discountPercentage: discountPercentage,
            discountAmount: discountAmount,
            orderAmount: totalPrice + discountAmount // Original amount before discount
          });

          await couponUsage.save();

          // Update coupon used count
          await Coupon.findByIdAndUpdate(
            couponId,
            { $inc: { usedCount: 1 } }
          );

          console.log(`Coupon usage recorded for order ${orderId}`);
        } catch (couponError) {
          console.error("Error recording coupon usage:", couponError);
          // Don't fail the order if coupon tracking fails
        }
      }

      console.log('Order created:', orderId, 'Payment method:', selectedPaymentMethod, 'Status:', orderStatus);

      // COD Payment
      if (selectedPaymentMethod === "Cash on Delivery") {
        await processOrderCompletion(userId, orderId, userCart);
        
        // Clear session data
        clearSessionDiscount(req);
        
        return res.json({ 
          codSucess: true,
          message: "Order placed successfully with COD"
        });
      }

      // Online Payment
      if (selectedPaymentMethod === "Online Payment") {
        const response = await RazorPay.paymentGateway.generateRazorPay(
          orderId.toString(), 
          totalPrice
        );
        
        console.log('Razorpay response:', response);
        
        return res.json({
          success: true,
          message: "Razorpay order created successfully",
          data: response,
        });
      }

      // Wallet Payment
      if (selectedPaymentMethod === "Wallet") {
        const user = await userData.findById(userId);
        if (!user) {
          return res.status(400).json({ 
            success: false,
            error: "User not found" 
          });
        }

        if (user.Wallet >= totalPrice) {
          const updatedWallet = user.Wallet - totalPrice;
          
          // Create debit transaction
          const debitTransaction = { 
            status: "debited", 
            amount: totalPrice, 
            timestamp: new Date(),
            orderId: orderId,
            description: `Payment for order #${orderId}`
          };

          // Update user wallet
          await userData.findByIdAndUpdate(
            userId,
            { 
              $push: { walletStatus: debitTransaction }, 
              $set: { Wallet: updatedWallet } 
            }
          );

          await processOrderCompletion(userId, orderId, userCart);
          
          // Clear session data
          clearSessionDiscount(req);
          
          return res.json({ 
            walletSucess: true,
            message: "Order placed successfully using wallet"
          });
        } else {
          return res.json({ 
            walletSucess: false, 
            message: "Insufficient wallet balance" 
          });
        }
      }

      // Invalid payment method
      return res.status(400).json({ 
        success: false,
        error: "Invalid payment method" 
      });

    } catch (error) {
      console.error('Order processing error:', error);
      return res.status(500).json({ 
        success: false,
        error: "Internal server error",
        message: error.message 
      });
    }
  },

  // Helper function to clear session discount
  clearSessionDiscount: async (req, res) => {
    try {
      clearSessionDiscount(req);
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing session discount:', error);
      res.json({ success: false });
    }
  }

};

// Helper function to process order completion
async function processOrderCompletion(userId, orderId, userCart) {
  // Reduce product stock
  await Promise.all(
    userCart.products.map(async (item) => {
      const product = await productModel.findById(item.productId);
      if (product) {
        const updatedCount = product.ProductCount - item.quantity;
        await productModel.findByIdAndUpdate(product._id, { 
          $set: { ProductCount: updatedCount } 
        });
      }
    })
  );

  // Clear cart
  await cartModel.updateOne(
    { userId }, 
    { $set: { products: [] } }
  );

  // FIXED: Do NOT update order status to "Processing" - keep it as "Active"
  // This allows the admin to manage the status workflow properly
  // Only update payment status if needed
  await orderModel.findByIdAndUpdate(
    orderId, 
    { 
      $set: { 
        paymentStatus: "Approved"
        // DO NOT change orderStatus here - keep it as "active"
      } 
    }
  );
}

// Helper function to clear session discount data
function clearSessionDiscount(req) {
  delete req.session.couponCode;
  delete req.session.couponId;
  delete req.session.discountPercentage;
  delete req.session.discountAmount;
  delete req.session.discountSuccess;
  delete req.session.discountError;
}

module.exports = { order };