// validators/couponValidators.js

const moment = require('moment');

function isValidCouponName(name) {
  if (!name || name.trim().length === 0) return 'Coupon name is required';
  if (name.length > 50) return 'Coupon name must not exceed 50 characters';
  return null;
}

function isValidCouponCode(code) {
  if (!code || code.trim().length === 0) return 'Coupon code is required';
  if (code.length > 20) return 'Coupon code must not exceed 20 characters';
  // Allow alphanumeric and hyphens
  if (!/^[A-Za-z0-9-]+$/.test(code)) return 'Coupon code can only contain letters, numbers, and hyphens';
  return null;
}

function isValidDiscountPercentage(percentage) {
  if (!percentage || isNaN(percentage)) return 'Discount percentage is required';
  if (percentage < 1) return 'Discount percentage must be at least 1%';
  if (percentage > 100) return 'Discount percentage cannot exceed 100%';
  return null;
}

function isValidMinOrderAmount(amount) {
  if (!amount || isNaN(amount)) return 'Minimum order amount is required';
  if (amount < 0) return 'Minimum order amount cannot be negative';
  return null;
}

function isValidMaxDiscountAmount(maxAmount, percentage, minOrderAmount) {
  if (maxAmount && maxAmount < 0) return 'Maximum discount amount cannot be negative';
  if (maxAmount && maxAmount < (minOrderAmount * percentage / 100)) {
    return 'Maximum discount amount should be reasonable';
  }
  return null;
}

function isValidStartDate(date) {
  if (!date) return 'Start date is required';
  const startDate = moment(date);
  if (!startDate.isValid()) return 'Invalid start date format';
  if (startDate.isBefore(moment().startOf('day'))) return 'Start date cannot be in the past';
  return null;
}

function isValidExpiryDate(expiryDate, startDate) {
  if (!expiryDate) return 'Expiry date is required';
  const expiry = moment(expiryDate);
  const start = moment(startDate);
  
  if (!expiry.isValid()) return 'Invalid expiry date format';
  if (expiry.isBefore(start)) return 'Expiry date must be after start date';
  if (expiry.isBefore(moment())) return 'Expiry date cannot be in the past';
  return null;
}

function isValidUsageLimit(limit) {
  if (limit && (isNaN(limit) || limit < 1)) return 'Usage limit must be at least 1 or empty for unlimited';
  return null;
}

function isValidUserLimit(limit) {
  if (!limit || isNaN(limit)) return 'User limit is required';
  if (limit < 1) return 'User limit must be at least 1';
  return null;
}

module.exports = {
  isValidCouponName,
  isValidCouponCode,
  isValidDiscountPercentage,
  isValidMinOrderAmount,
  isValidMaxDiscountAmount,
  isValidStartDate,
  isValidExpiryDate,
  isValidUsageLimit,
  isValidUserLimit
};