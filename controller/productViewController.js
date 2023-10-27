const model = require('../models/productModel')

const productViewAll = {
     productView : async (req,res)=>{
        const productId = req.query.id
      const product = await model.findOne({_id:productId})
      res.render('productView', {product})
     }
} 
 

module.exports ={productViewAll} 