// couponController.js
const {
    isValidCouponName,
    isValidCouponCode,
    isValidActiveDate,
    isValidExpireDate,
    isValidCreteria,
    isValidDiscountAmount,
} = require('../validators/adminValidation');
const moment = require('moment');
const Coupon = require('../models/couponModel');

const couponController = {
    couponPage: async (req, res) => {
        try {
    
            const coupons = await Coupon.find({});
            const currentDate = moment();

            for (const coupon of coupons) {
                if (currentDate.isAfter(coupon.ExpireDate)) {
                    await Coupon.findByIdAndUpdate(coupon._id, { $set: { couponStatus: 'Expired' } });
                }
            }

            console.log('coupons',);
            res.render('adminCoupon', { coupons , errors:'' });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    couponAdd: async (req, res) => {
        try {
            const { couponName, couponCode, ActiveDate, ExpireDate, Creteria, discountAmount } = req.body;
            const coupons = await Coupon.find({});
            const currentDate = moment();

            for (const coupon of coupons) {
                if (currentDate.isAfter(coupon.ExpireDate)) {
                    await Coupon.findByIdAndUpdate(coupon._id, { $set: { couponStatus: 'Expired' } });
                }
            }
            
            const errors = {
                couponName: isValidCouponName(couponName),
                couponCode: isValidCouponCode(couponCode),
                ActiveDate: isValidActiveDate(ActiveDate),
                ExpireDate: isValidExpireDate(ExpireDate, ActiveDate),
                Creteria: isValidCreteria(Creteria),
                discountAmount: isValidDiscountAmount(discountAmount, Creteria),
            };
            const hasError = Object.values(errors).some((error) => error !== null);
            if (hasError) {
                console.log('errors ', errors);
                return res.render('adminCoupon', { errors , coupons});
            }

            const newCoupon = new Coupon({
                couponName,
                couponCode,
                ActiveDate: moment(ActiveDate).toDate(), // convert to Date type
                ExpireDate: moment(ExpireDate).toDate(), // convert to Date type
                Creteria,
                discountAmount,
            });

            await newCoupon.save();
            res.redirect('/admin/coupon');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
};

module.exports = {couponController};
