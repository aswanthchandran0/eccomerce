const model = require('../models/userModel')
const AddressModel = require('../models/userAddressModel')
const orderData = require('../models/orderModel')
const productModel = require('../models/productModel')
const {isValidFname,isValidEmail,isValidPhoneNumber, isValidPincode,isValidAddress,isValidPlace,isValidstate,isValidLandMark,isValidAphoneNumber} = require('../validators/userAddressValidator');
const moment = require('moment');
const Coupon = require('../models/couponModel');
const Wishlist = require('../models/wishlistModel');

const userProfile = {
     // Dashboard
dashboard: async (req, res) => {
    try {
        console.log('Dashboard function called');
        const userId = req.session.user._id;
        const user = await model.findOne({ _id: userId });
        const currentDate = new Date();
        
        // Order count
        const orderCount = await orderData.countDocuments({ userId: userId });
        
        // Wishlist count
        const wishlistCount = await Wishlist.findOne({ userId: userId }).then(wishlist => {
            return wishlist ? wishlist.products.length : 0;
        });
        
        // Get user's used coupons from orders
        const userOrders = await orderData.find({ 
            userId: userId,
            'couponApplied.couponCode': { $exists: true }
        }).lean();
        
        // Create a map of coupon codes used by this user
        const usedCouponCodes = {};
        userOrders.forEach(order => {
            if (order.couponApplied?.couponCode) {
                usedCouponCodes[order.couponApplied.couponCode] = 
                    (usedCouponCodes[order.couponApplied.couponCode] || 0) + 1;
            }
        });
        
        // Get all active coupons from database
        const activeCoupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: currentDate },
            startDate: { $lte: currentDate }
        }).lean();
        
        // Filter coupons that are still valid for this user (not expired and not used beyond limit)
        const validCouponsForUser = activeCoupons.filter(coupon => {
            // Check if user has used this coupon
            const timesUsedByUser = usedCouponCodes[coupon.couponCode] || 0;
            const userLimit = coupon.userLimit || 1; // Default to 1 if not specified
            
            // Coupon is valid if user hasn't reached their usage limit
            return timesUsedByUser < userLimit;
        });
        
        // Count only valid coupons for the user
        const couponCount = validCouponsForUser.length;
        
        // Get recent orders
        const recentOrders = await orderData.find({ userId: userId })
            .sort({ orderDate: -1 })
            .limit(5)
            .lean();
        
        const formattedOrders = recentOrders.map(order => ({
            orderId: order._id.toString().slice(-6).toUpperCase(),
            date: moment(order.orderDate).format('MMM D, YYYY'),
            status: order.orderStatus,
            amount: order.Total
        }));

        const memberSince = user.createdAt ? moment(user.createdAt).format('MMM YYYY') : 'Recent';
        const totalSpent = formattedOrders.reduce((sum, order) => sum + order.amount, 0);
        const deliveredOrders = formattedOrders.filter(order => order.status.toLowerCase() === 'delivered').length;
        
        // Calculate some stats for the dashboard
        const averageOrderValue = orderCount > 0 ? (totalSpent / orderCount).toFixed(2) : 0;
        
        // Get last 30 days orders for spending trend
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysOrders = await orderData.find({
            userId: userId,
            orderDate: { $gte: thirtyDaysAgo }
        });
        
        const last30DaysSpent = last30DaysOrders.reduce((sum, order) => sum + order.Total, 0);

        res.render('profile/dashboard', {
            user: req.session.user,
            currentPage: 'dashboard',
            wallet: user.Wallet || 0,
            orderCount,
            wishlistCount,
            couponCount,
            recentOrders: formattedOrders,
            memberSince: memberSince,
            totalSpent: totalSpent,
            deliveredOrders: deliveredOrders,
            recentOrdersCount: formattedOrders.length,
            // Additional stats for dashboard
            averageOrderValue: averageOrderValue,
            last30DaysSpent: last30DaysSpent,
            // For display in sidebar if needed
            validCouponCodes: validCouponsForUser.map(coupon => coupon.couponCode)
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Internal server error');
    }
},
    // Orders Page
    orders: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;

            const orders = await orderData.find({ userId: userId })
                .sort({ orderDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const formattedOrders = orders.map(order => {
                const totalItems = order.productDetails.reduce((sum, item) => sum + item.purchasedCount, 0);
                
                return {
                    _id: order._id,
                    orderId: order._id.toString().slice(-6).toUpperCase(),
                    date: moment(order.orderDate).format('MMM D, YYYY h:mm A'),
                    items: totalItems,
                    amount: order.Total,
                    status: order.orderStatus,
                    paymentStatus: order.paymentStatus
                };
            });

            const totalOrders = await orderData.countDocuments({ userId: userId });
            const totalPages = Math.ceil(totalOrders / limit);

            res.render('profile/orders', {
                user: req.session.user,
                currentPage: 'orders',
                orders: formattedOrders,
                currentPageNum: page,
                totalPages,
                totalOrders,
                orderCount: totalOrders
            });

        } catch (error) {
            console.error('Orders error:', error);
            res.status(500).send('Internal server error');
        }
    },

    // Wallet Page
    wallet: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const user = await model.findOne({ _id: userId });
            
            const wishlist = await Wishlist.findOne({ userId: userId });
            const wishlistCount = wishlist ? wishlist.products.length : 0;
            
            const orderCount = await orderData.countDocuments({ userId: userId });
            
            const currentDate = moment();
            const couponCount = await Coupon.countDocuments({
                couponStatus: 'Active',
                ExpireDate: { $gt: currentDate }
            });
            
            let runningBalance = user.Wallet || 0;
            const formattedTransactions = user.walletStatus
                ? user.walletStatus.map(transaction => {
                    return {
                        timestamp: moment(transaction.timestamp).format('MMM D, YYYY h:mm A'),
                        description: transaction.status === 'credited' ? 'Wallet Credit' : 'Wallet Debit',
                        transactionId: `TXN${transaction.timestamp.getTime().toString().slice(-6)}`,
                        amount: transaction.amount,
                        type: transaction.status,
                        status: 'completed',
                        icon: transaction.status === 'credited' ? 'plus-circle' : 'minus-circle',
                        iconColor: transaction.status === 'credited' ? 'success' : 'danger'
                    };
                }).reverse()
                : [];

            const memberSince = user && user.createdAt ? moment(user.createdAt).format('MMM YYYY') : 'Recent';

            res.render('profile/wallet', {
                user: req.session.user,
                currentPage: 'wallet',
                wallet: user.Wallet || 0,
                walletTransactions: formattedTransactions,
                wishlistCount,
                orderCount,
                couponCount,
                memberSince
            });

        } catch (error) {
            console.error('Wallet error:', error);
            res.status(500).send('Internal server error');
        }
    },
    // Offers Page
  offers: async (req, res) => {
    try {
        const userId = req.session.user._id;
        const currentDate = new Date();
        
        // First, get all active coupons
        const activeCoupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: currentDate },
            startDate: { $lte: currentDate }
        }).lean();
        
        // Get user's used coupons from orders
        const userOrders = await orderData.find({ 
            userId: userId,
            'couponApplied.couponCode': { $exists: true }
        });
        
        // Create a map of coupon codes used by this user
        const usedCouponCodes = {};
        userOrders.forEach(order => {
            if (order.couponApplied?.couponCode) {
                usedCouponCodes[order.couponApplied.couponCode] = 
                    (usedCouponCodes[order.couponApplied.couponCode] || 0) + 1;
            }
        });
        
        // Format coupons and check if user has used them
        const formattedCoupons = activeCoupons.map(coupon => {
            // Check if user has used this coupon
            const timesUsedByUser = usedCouponCodes[coupon.couponCode] || 0;
            const isUsedByUser = timesUsedByUser >= (coupon.userLimit || 1);
            const isExpiredForUser = isUsedByUser || coupon.expiryDate <= currentDate;
            
            // Calculate discount amount
            const demoOrderAmount = 1000;
            let discountAmount = 0;
            let discountText = '';
            
            if (demoOrderAmount >= coupon.minOrderAmount) {
                discountAmount = (demoOrderAmount * coupon.discountPercentage) / 100;
                
                if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                    discountAmount = coupon.maxDiscountAmount;
                }
                
                discountAmount = Math.round(discountAmount);
                discountText = `₹${discountAmount} OFF`;
            }
            
            // Calculate usage percentage
            let usagePercentage = 0;
            if (coupon.usageLimit && coupon.usageLimit > 0) {
                usagePercentage = Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100);
            }
            
            return {
                ...coupon,
                ExpireDate: moment(coupon.expiryDate).format('MMM D, YYYY'),
                discountAmount: discountAmount,
                discountText: discountText,
                Creteria: coupon.minOrderAmount,
                maxDiscount: coupon.maxDiscountAmount || 'No limit',
                usagePercentage: usagePercentage.toFixed(0),
                usedCount: coupon.usedCount || 0,
                usageLimit: coupon.usageLimit || 0,
                timesUsedByUser: timesUsedByUser,
                userLimit: coupon.userLimit || 1,
                isUsedByUser: isUsedByUser,
                isExpiredForUser: isExpiredForUser,
                status: isExpiredForUser ? 'expired' : 'active'
            };
        });

        res.render('profile/offers', {
            user: req.session.user,
            currentPage: 'offers',
            activeCoupons: formattedCoupons.filter(c => !c.isExpiredForUser),
            expiredCoupons: formattedCoupons.filter(c => c.isExpiredForUser),
            couponCount: formattedCoupons.filter(c => !c.isExpiredForUser).length,
            orderCount: 0
        });

    } catch (error) {
        console.error('Offers error:', error);
        res.status(500).send('Internal server error');
    }
},
    // Addresses Page
addresses: async (req, res) => {
    try {
        const userId = req.session.user._id;
        const userAddress = await AddressModel.findOne({ user: userId });
        const addressCount = userAddress ? userAddress.address.length : 0;

        console.log('DEBUG: Address data fetched:', JSON.stringify(userAddress, null, 2));
        
        // Pass validationErr with lowercase 'v'
        res.render('profile/addresses', {
            user: req.session.user,
            currentPage: 'addresses',
            userdata: userAddress,
            addressCount: addressCount,
            validationErr: req.session.validationErr || null, // lowercase v
            updatedAddressValidationErr: req.session.updatedAddressValidationErr || null,
            // Add oldData for form repopulation
            oldData: req.session.oldData || null
        });

        // Clear session data after passing to template
        req.session.validationErr = null;
        req.session.updatedAddressValidationErr = null;
        req.session.oldData = null;

    } catch (error) {
        console.error('Addresses error:', error);
        res.status(500).send('Internal server error');
    }
},

   userAddress: async (req, res) => {
    console.log('====== DEBUG: userAddress function START ======');
    console.log('1. Request method:', req.method);
    console.log('2. Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
        recipientName, 
        phoneNumber, 
        pincode, 
        address: addressLine,
        place, 
        state, 
        landmark, 
        alternatePhone, 
        addressType,
        isDefault 
    } = req.body;

    console.log('Form fields received:');
    console.log('- recipientName:', recipientName);
    console.log('- phoneNumber:', phoneNumber);
    console.log('- pincode:', pincode);
    console.log('- addressLine:', addressLine);
    console.log('- place:', place);
    console.log('- state:', state);
    console.log('- addressType:', addressType);

    // Store old data in session for form repopulation
    req.session.oldData = {
        recipientName,
        phoneNumber,
        pincode,
        address: addressLine,
        place,
        state,
        landmark,
        alternatePhone,
        addressType,
        isDefault
    };

    // Make sure to import your validation functions correctly
    // Assuming they are imported as a module
    const {
        isValidFname,
        isValidEmail,
        isValidPhoneNumber,
        isValidPincode,
        isValidAddress,
        isValidPlace,
        isValidstate,
        isValidLandMark,
        isValidAphoneNumber
    } = require('../validators/userAddressValidator'); // Adjust path as needed

    const errors = {
        Fname: isValidFname(recipientName),
        Email: isValidEmail(req.session.user.Email),
        PhoneNumber: isValidPhoneNumber(phoneNumber),
        Pincode: isValidPincode(pincode),
        Address: isValidAddress(addressLine),
        Place: isValidPlace(place),
        state: isValidstate(state),
        LandMark: isValidLandMark(landmark),
        AphoneNumber: isValidAphoneNumber(alternatePhone)
    };

    console.log('Validation errors:', errors);

    // Filter out null errors
    const filteredErrors = {};
    Object.keys(errors).forEach(key => {
        if (errors[key] !== null) {
            filteredErrors[key] = errors[key];
        }
    });

    const hasErrors = Object.keys(filteredErrors).length > 0;

    if (hasErrors) {
        console.log('Validation failed, redirecting with errors');
        req.session.validationErr = filteredErrors; // Store filtered errors
        return res.redirect('/userProfile/addresses');
    }

    try {
        const userId = req.session.user._id;
        console.log('User ID:', userId);
        
        // Find existing address document
        let userAddress = await AddressModel.findOne({ user: userId });
        console.log('Found address document:', userAddress ? 'Yes' : 'No');
        
        // If no address exists, create one
        if (!userAddress) {
            console.log('Creating new address document');
            userAddress = new AddressModel({
                user: userId,
                address: []
            });
        }
        
        // Check if this is the first address
        const isFirstAddress = userAddress.address.length === 0;
        console.log('Is first address?', isFirstAddress);
        
        // If setting as default or first address, update all other addresses to non-default
        if (isDefault === 'on' || isFirstAddress) {
            console.log('Setting as default address');
            userAddress.address.forEach(addr => {
                addr.isDefault = false;
            });
        }
        
        // Create new address object with CORRECT field names for your model
        const newAddress = {
            Fname: recipientName,
            Email: req.session.user.Email,
            PhoneNumber: phoneNumber,
            Pincode: pincode,
            Address: addressLine,
            Place: place,
            state: state,
            LandMark: landmark || '',
            AphoneNumber: alternatePhone || '',
            AddressType: addressType,
            isDefault: isFirstAddress || (isDefault === 'on')
        };
        
        console.log('Adding new address:', newAddress);
        
        userAddress.address.push(newAddress);
        
        await userAddress.save();
        console.log('Address saved successfully');

        // Clear session data
        req.session.validationErr = null;
        req.session.oldData = null;
        
        console.log('Redirecting to addresses page');
        return res.redirect('/userProfile/addresses');

    } catch (error) {
        console.error('Add address error:', error);
        
        // Set error message for debugging
        req.session.validationErr = { 
            serverError: 'Failed to save address: ' + error.message 
        };
        req.session.oldData = req.body; // Keep form data
        return res.redirect('/userProfile/addresses');
    }
},
    // Set Default Address
    setDefaultAddress: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const { addressId } = req.body;

            const userAddress = await AddressModel.findOne({ user: userId });
            
            if (!userAddress) {
                return res.json({ 
                    success: false, 
                    error: 'Address not found' 
                });
            }

            userAddress.address.forEach(addr => {
                addr.isDefault = false;
            });

            const addressToUpdate = userAddress.address.id(addressId);
            if (addressToUpdate) {
                addressToUpdate.isDefault = true;
                await userAddress.save();
                
                return res.json({ 
                    success: true, 
                    message: 'Default address updated successfully' 
                });
            } else {
                return res.json({ 
                    success: false, 
                    error: 'Address not found' 
                });
            }

        } catch (error) {
            console.error('Set default address error:', error);
            return res.json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    },

    // Delete Address
    deleteAddress: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const { addressId } = req.body;

            const userAddress = await AddressModel.findOne({ user: userId });
            
            if (!userAddress) {
                return res.json({ success: false, error: 'Address not found' });
            }

            const addressIndex = userAddress.address.findIndex(addr => addr._id.toString() === addressId);
            
            if (addressIndex === -1) {
                return res.json({ success: false, error: 'Address not found' });
            }

            userAddress.address.splice(addressIndex, 1);
            await userAddress.save();

            res.json({ success: true, message: 'Address deleted successfully' });

        } catch (error) {
            console.error('Delete address error:', error);
            res.json({ success: false, error: 'Internal server error' });
        }
    },

    // Wishlist Page
    wishlist: async (req, res) => {
        try {
            const userId = req.session.user._id;
            
            const wishlistItems = await Wishlist.find({ userId: userId })
                .populate('productId')
                .lean();
            
            const wishlistCount = wishlistItems.length;

            res.render('profile/wishlist', {
                user: req.session.user,
                currentPage: 'wishlist',
                wishlistItems: wishlistItems,
                wishlistCount: wishlistCount
            });

        } catch (error) {
            console.error('Wishlist error:', error);
            res.status(500).send('Internal server error');
        }
    },

    // Settings Page
    settings: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const user = await model.findOne({ _id: userId });

            res.render('profile/settings', {
                user: req.session.user,
                currentPage: 'settings',
                userDetails: user
            });

        } catch (error) {
            console.error('Settings error:', error);
            res.status(500).send('Internal server error');
        }
    },

 // Update Address
updateAddress: async (req, res) => {
    console.log('====== DEBUG: updateAddress function START ======');
    console.log('1. Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
        addressId,
        recipientName,
        email, 
        phoneNumber, 
        pincode, 
        address, 
        place, 
        state, 
        landmark, 
        alternatePhone,
        addressType,
        isDefault 
    } = req.body;

    try {
        const userId = req.session.user._id;
        const userAddress = await AddressModel.findOne({ user: userId });
        
        if (!userAddress) {
            throw new Error('User address document not found');
        }

        console.log('2. Looking for address with ID:', addressId);
        
        // Find address by ID using Mongoose's id() method
        const addressToUpdate = userAddress.address.id(addressId);
        
        if (!addressToUpdate) {
            console.log('3. Address not found with ID:', addressId);
            throw new Error('Address not found');
        }

        console.log('4. Found address to update');
        
        // Update fields
        addressToUpdate.Fname = recipientName;
        addressToUpdate.Email = email || req.session.user.Email;
        addressToUpdate.PhoneNumber = phoneNumber;
        addressToUpdate.Pincode = pincode;
        addressToUpdate.Address = address;
        addressToUpdate.Place = place;
        addressToUpdate.state = state;
        addressToUpdate.LandMark = landmark || '';
        addressToUpdate.AphoneNumber = alternatePhone || '';
        addressToUpdate.AddressType = addressType;
        
        // Handle isDefault checkbox - Check if checkbox was checked
        if (isDefault === 'on') {
            console.log('5. Setting as default address');
            // Set all addresses to non-default first
            userAddress.address.forEach(addr => {
                addr.isDefault = false;
            });
            addressToUpdate.isDefault = true;
        } else {
            addressToUpdate.isDefault = false;
        }

        await userAddress.save();
        console.log('6. Address updated successfully');

        return res.json({ 
            success: true, 
            message: 'Address updated successfully' 
        });

    } catch (error) {
        console.error('Update address error:', error);
        
        return res.json({ 
            success: false, 
            error: 'Failed to update address: ' + error.message 
        });
    }
},
    // Get single address for editing
    addressHandler: async (req, res) => {
        try {
            const user = req.session.user;
            const index = req.query.index;

            if (user) {
                const userId = req.session.user._id;
                
                if (index !== null && index !== undefined) {
                    const userAddress = await AddressModel.findOne({ user: userId });
                    
                    if (userAddress && userAddress.address.length > index) {
                        const addressData = userAddress.address[index];
                        
                        return res.json({ 
                            success: true, 
                            address: addressData, 
                            index: index 
                        });
                    }
                }
            }
            
            return res.status(404).json({ 
                success: false, 
                error: 'Address not found' 
            });

        } catch (error) {
            console.error('Address handler error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    },

    // Add money to wallet
    addMoneyToWallet: async (req, res) => {
        try {
            const { amount, paymentMethod } = req.body;
            const userId = req.session.user._id;
            
            if (!amount || amount < 100) {
                return res.json({ 
                    success: false, 
                    error: 'Minimum amount is ₹100' 
                });
            }
            
            const user = await model.findOne({ _id: userId });
            user.Wallet += parseInt(amount);
            
            user.walletStatus.push({
                status: 'credited',
                amount: parseInt(amount),
                timestamp: new Date()
            });
            
            await user.save();
            
            return res.json({ 
                success: true, 
                message: '₹' + amount + ' added to wallet successfully',
                newBalance: user.Wallet
            });

        } catch (error) {
            console.error('Add money error:', error);
            return res.json({ 
                success: false, 
                error: 'Failed to add money' 
            });
        }
    },

    // Sign out
    signout: async (req, res) => {
        req.session.user = null;
        res.redirect('/');
    },

    // Cancel Order
    cancelOrder: async (req, res) => {
        try {
            const { orderId } = req.body;
            const userId = req.session.user._id;
            
            const order = await orderData.findOne({ 
                _id: orderId, 
                userId: userId 
            });
            
            if (!order) {
                return res.json({ 
                    success: false, 
                    error: 'Order not found' 
                });
            }
            
            order.orderStatus = 'cancelled';
            await order.save();
            
            return res.json({ 
                success: true, 
                message: 'Order cancelled successfully' 
            });

        } catch (error) {
            console.error('Cancel order error:', error);
            return res.json({ 
                success: false, 
                error: 'Failed to cancel order' 
            });
        }
    }
};

module.exports = userProfile;