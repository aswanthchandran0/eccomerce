const mongoose = require('mongoose');
const moment = require('moment'); // for date manipulation

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true,
    },
    couponCode: {
        type: String,
        required: true,
    },
    ActiveDate: {
        type: Date,
        required: true, 
    },
    ExpireDate: {
        type: Date,
        required: true,
    },
    Creteria: {
        type: Number,
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    couponStatus: {
        type: String,
        default: 'Active', // assuming a coupon is active by default
    },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon