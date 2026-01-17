const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true,
        trim: true
    },
    couponCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    minOrderAmount: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    userLimit: {
        type: Number,
        default: 1 // How many times a single user can use
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
    return this.expiryDate < new Date();
});

// Virtual to check if coupon is valid
couponSchema.virtual('isValid').get(function() {
    const now = new Date();
    return this.isActive && 
           this.startDate <= now && 
           this.expiryDate >= now &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
    if (orderAmount < this.minOrderAmount) {
        return 0;
    }
    
    let discountAmount = (orderAmount * this.discountPercentage) / 100;
    
    // Apply max discount limit if set
    if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
        discountAmount = this.maxDiscountAmount;
    }
    
    return Math.round(discountAmount);
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;