const model = require('../models/productModel')

const product = {
     getAllProduct: async (req,res)=>{
        const productData=  await model.find()
        console.log(productData);   
        res.render('productDetails',{productData}) 
     }
}

module.exports = {product}