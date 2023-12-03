//product Validation

function iSValidProductName(ProductName){
    if(ProductName.length=== 0){
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

function isValidProductExpense(ProductExpense){
    if(ProductExpense === null || ProductExpense <=0){
        return 'valid expense is required'
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
    if(ProductDiscription.length === 0){
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


module.exports = {iSValidProductName,isValidProductPrice,isValidProductExpense,isValidProductProductCount,isValidProductDiscription,isValidImage,isValidCatagory}