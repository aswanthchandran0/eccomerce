const model = require('../models/productModel')

const productViewAll = {
     productView : async (req,res)=>{
        const productId = req.query.id
      const product = await model.findOne({_id:productId})
      if (product) {
        res.render('productView', { product: product });
    } else {
        // Handle the case where the product data is null or undefined
        res.send('Product not found');
    }
     } 
} 
 

module.exports ={productViewAll} 