// couponController.js
const Coupon = require('../models/couponModel');
const {
  isValidCouponName,
  isValidCouponCode,
  isValidDiscountPercentage,
  isValidMinOrderAmount,
  isValidMaxDiscountAmount,
  isValidStartDate,
  isValidExpiryDate,
  isValidUsageLimit,
  isValidUserLimit
} = require('../validators/couponValidators');

const couponController = {
  // Render coupon page
  couponPage: async (req, res) => {
    try {
      const COUPON_PER_PAGE = 10;
      const page = parseInt(req.query.page) || 1;
      
      // Get total count and coupons with pagination
      const totalCoupon = await Coupon.countDocuments({});
      const totalPages = Math.ceil(totalCoupon / COUPON_PER_PAGE);
      
      // Get coupons sorted by creation date
      const coupons = await Coupon.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * COUPON_PER_PAGE)
        .limit(COUPON_PER_PAGE)
        .lean(); // Convert to plain objects

      // Update expired coupons
      const now = new Date();
      const expiredCoupons = coupons.filter(coupon => 
        coupon.expiryDate < now || coupon.isExpired
      );
      
      for (const coupon of expiredCoupons) {
        await Coupon.findByIdAndUpdate(coupon._id, { isActive: false });
      }

      res.render('adminCoupon', {
        coupons,
        errors: null,
        success: req.query.success || null,
        error: req.query.error || null,
        totalPages,
        currentPage: page,
        formData: null
      });
    } catch (error) {
      console.error('Error in couponPage:', error);
      res.status(500).render('adminCoupon', {
        coupons: [],
        errors: { message: 'Error loading coupons' },
        success: null,
        error: 'Failed to load coupons',
        totalPages: 1,
        currentPage: 1,
        formData: null
      });
    }
  },

  // Add new coupon
  couponAdd: async (req, res) => {
    try {
      const {
        couponName,
        couponCode,
        discountPercentage,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        expiryDate,
        usageLimit,
        userLimit
      } = req.body;

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({ 
        couponCode: couponCode.toUpperCase().trim() 
      });
      
      if (existingCoupon) {
        return res.redirect('/admin/coupon?error=Coupon code already exists');
      }

      // Validate inputs
      const errors = {
        couponName: isValidCouponName(couponName),
        couponCode: isValidCouponCode(couponCode),
        discountPercentage: isValidDiscountPercentage(discountPercentage),
        minOrderAmount: isValidMinOrderAmount(minOrderAmount),
        maxDiscountAmount: isValidMaxDiscountAmount(maxDiscountAmount, discountPercentage, minOrderAmount),
        startDate: isValidStartDate(startDate),
        expiryDate: isValidExpiryDate(expiryDate, startDate),
        usageLimit: isValidUsageLimit(usageLimit),
        userLimit: isValidUserLimit(userLimit)
      };

      // Check if there are any errors
      const hasErrors = Object.values(errors).some(error => error !== null);
      
      if (hasErrors) {
        // Get current coupons for the page
        const COUPON_PER_PAGE = 10;
        const page = 1;
        const coupons = await Coupon.find({})
          .sort({ createdAt: -1 })
          .limit(COUPON_PER_PAGE)
          .lean();

        return res.render('adminCoupon', {
          coupons,
          errors,
          success: null,
          error: null,
          totalPages: 1,
          currentPage: page,
          formData: req.body
        });
      }

      // Create new coupon
      const newCoupon = new Coupon({
        couponName: couponName.trim(),
        couponCode: couponCode.toUpperCase().trim(),
        discountPercentage: parseInt(discountPercentage),
        minOrderAmount: parseFloat(minOrderAmount),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        userLimit: parseInt(userLimit),
        isActive: true
      });

      await newCoupon.save();
      
      res.redirect('/admin/coupon?success=Coupon added successfully');
      
    } catch (error) {
      console.error('Error in couponAdd:', error);
      res.redirect('/admin/coupon?error=Failed to add coupon');
    }
  },

  // Toggle coupon status
  toggleCouponStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupon.isActive = !coupon.isActive;
      await coupon.save();

      res.json({ 
        success: true, 
        message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
        isActive: coupon.isActive 
      });
    } catch (error) {
      console.error('Error in toggleCouponStatus:', error);
      res.status(500).json({ success: false, message: 'Failed to update coupon status' });
    }
  },

  // Delete coupon
  deleteCoupon: async (req, res) => {
    try {
      const { id } = req.params;
      
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      res.json({ 
        success: true, 
        message: 'Coupon deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteCoupon:', error);
      res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
  }
};

module.exports = { couponController };