function isValidpaymentMethod(paymentMethod){
    if(paymentMethod ===null || paymentMethod === undefined){
        return 'chose the payment methord'
    }
    return null
}

function isValidselectedAddressId(selectedAddressId){
    if(selectedAddressId === null || selectedAddressId === undefined){
        return 'chose a address'
    }
    return null
}


module.exports = {isValidpaymentMethod,isValidselectedAddressId}