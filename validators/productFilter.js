const productData = require('../models/productModel')

async function filterProducts(selectedBrands,selectedCategory,selectedSize){
    try{
       filter = {}
            if(selectedBrands && selectedBrands.length>0){
                filter.$or = [{Brand:{$in:selectedBrands}}]
            }

            if(selectedCategory && selectedCategory.length>0){
                filter.$or = [{Catagory:{$in:selectedCategory}}]
            }
            if(selectedSize && selectedSize.length>0){
                filter.$or = [{ProductSize:selectedSize}]
            }
            const result = await productData.aggregate([
                {
                    $match:filter,
                }
            ])
            return result
    }catch(error){
        console.log(error);
        res.status(500)
    }
}
module.exports ={filterProducts}