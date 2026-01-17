const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    couponCode: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    orderAmount: {
        type: Number,
        required: true
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
});

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);

module.exports = CouponUsage;