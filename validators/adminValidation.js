//product Validation


function iSValidProductName(ProductName){
    if(ProductName.trim().length=== 0){
        return 'product Name is required'
    }
    return null
}

function isValidProductPrice(ProductPrice){
    if(ProductPrice === null || ProductPrice <=0){
        return 'valid price is required'
    }
    return null
}

function isValidProductExpense(ProductExpense,ProductPrice){
        if(ProductExpense>ProductPrice){
            return 'product expense is greater the product price'
        }else if(ProductExpense.trim().length<=0){
            return 'valid price is required'
        }
        return null

}

function isValidProductProductCount(ProductCount){
    if(ProductCount <=0){
        return 'stock is required'
    }
    return null
}

function isValidProductDiscription(ProductDiscription){
    if(ProductDiscription.trim().length === 0){
        return 'discription is requied'
    }
    return null
}

function isValidImage(newImages){
    if(newImages.length ===0){
        return 'image is required'
    }
    return null
}

function isValidCatagory(Catagory){
    if(Catagory === null || Catagory === undefined){
        return 'category is required'
    }
    return null
}

function isValidCouponName(couponName) {
    if (!couponName || couponName.trim().length === 0) {
        return 'Coupon name is required';
    }
    return null;
}

function isValidCouponCode(couponCode) {
    if (!couponCode || couponCode.trim().length === 0) {
        return 'Coupon code is required';
    }
    return null;
}

function isValidActiveDate(ActiveDate) {
    const currentDate = new Date();
    const inputDate = new Date(ActiveDate);

    if (!ActiveDate || inputDate < currentDate) {
        return 'Invalid or expired activation date';
    }
    return null;
}

function isValidExpireDate(ExpireDate, ActiveDate) {
    const currentDate = new Date();
    const inputDate = new Date(ExpireDate);
    const activationDate = new Date(ActiveDate);

    if (!ExpireDate || inputDate <= currentDate || inputDate <= activationDate) {
        return 'Invalid or expired expiration date';
    }
    return null;
}

function isValidCreteria(Creteria) {
    if (!Creteria || Creteria.trim().length === 0) {
        return 'Creteria is required';
    }
    return null;
}

function isValidDiscountAmount(discountAmount, Creteria) {
    const numericDiscountAmount = parseFloat(discountAmount);
    const numericCreteria = parseFloat(Creteria);

    if (isNaN(numericDiscountAmount) || numericDiscountAmount <= 0) {
        return 'Discount amount must be a valid positive number';
    }

    if (numericDiscountAmount > numericCreteria) {
        return 'Discount amount cannot be greater than the creterial amount';
    }

    return null;
}

module.exports = {iSValidProductName,isValidProductPrice,isValidProductExpense,isValidProductProductCount,isValidProductDiscription,isValidImage,isValidCatagory, isValidCouponName,
    isValidCouponCode,
    isValidActiveDate,
    isValidExpireDate,
    isValidCreteria,
    isValidDiscountAmount,}