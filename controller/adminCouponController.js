// couponController.js
const {
    isValidCouponName,
    isValidCouponCode,
    isValidActiveDate,
    isValidExpireDate,
    isValidCreteria,
    isValidDiscountAmount,
} = require('../validators/productValidators');
const moment = require('moment');
const Coupon = require('../models/couponModel');

const couponController = {
    couponPage: async (req, res) => {
        const COUPON_PER_PAGE = 10
        let couponCodeExist = null
        try {
            const page = parseInt(req.query.page) || 1
            const totalCoupon = await Coupon.countDocuments({})
            const totalPages = Math.ceil(totalCoupon/COUPON_PER_PAGE)    
            const coupons = await Coupon.find({})
            .skip((page -1)*COUPON_PER_PAGE)
            .limit(COUPON_PER_PAGE)
            const currentDate = moment();

            for (const coupon of coupons) {
                if (currentDate.isAfter(coupon.ExpireDate)) {
                    await Coupon.findByIdAndUpdate(coupon._id, { $set: { couponStatus: 'Expired' } });
                }
            }

            console.log('coupons',);
            res.render('adminCoupon', {couponCodeExist:couponCodeExist?couponCodeExist:'', coupons , errors:'' ,totalPages,currentPage:page});
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    couponAdd: async (req, res) => {
        const COUPON_PER_PAGE = 10
        let couponCodeExist = null
        try {
            const page = parseInt(req.query.page) || 1
            const totalCoupon = await Coupon.countDocuments({})
            const totalPages = Math.ceil(totalCoupon/COUPON_PER_PAGE)    
            const { couponName, couponCode, ActiveDate, ExpireDate, Creteria, discountAmount } = req.body;
            const coupons = await Coupon.find({})
            .skip((page -1)*COUPON_PER_PAGE)
            .limit(COUPON_PER_PAGE)
            const currentDate = moment();
           
            const couponCodes = coupons.map((coupon)=> coupon.couponCode)
            console.log('coupon codes',couponCodes);

           
            
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
            if (couponCodes.includes(couponCode)) {
                 couponCodeExist = 'coupon code already exist'
                return res.render('adminCoupon', { couponCodeExist:couponCodeExist?couponCodeExist:'',errors , coupons,totalPages,currentPage:page });
            }

            if (hasError) {
                console.log('errors ', errors);
                return res.render('adminCoupon', {couponCodeExist:couponCodeExist?couponCodeExist:'', errors , coupons,totalPages,currentPage:page});
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
