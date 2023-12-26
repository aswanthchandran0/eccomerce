const ProductDetails = require('../models/productModel');
const model = require('../models/productModel')
const fs = require('fs')

const product = {
     getAllProduct: async (req,res)=>{ 
      const PRODUCT_PER_PAGE = 10
        const page = parseInt(req.query.page) || 1
        const totaProduct = await model.countDocuments({})
        const totalPages = Math.ceil(totaProduct/PRODUCT_PER_PAGE)
            console.log('total pages',totalPages);
            console.log('total products',totaProduct);
        const productData=  await model.find({})
        .skip((page -1)*PRODUCT_PER_PAGE)
        .limit(PRODUCT_PER_PAGE)
        res.render('productDetails',{productData,totalPages,currentPage:page}) 
     },
     deleteProduct : async (req,res)=>{
        const productId = req.params.id
        try{ 
         const product =  await model.findById(productId)
           await  model.findByIdAndRemove(productId)
           if(product && product.images && product.images.length>0){
            product.images.forEach((image)=>{
               const imagePath = `${image}`
               console.log('imge path',imagePath);
                     if(fs.existsSync(imagePath)){
                        fs.unlinkSync(imagePath)

                        console.log(`Deleted image: ${image}`);
                     }else{
                        console.log(`Image not found: ${image}`);
                     }
            })
           }
           res.redirect('/admin/ProductDetails')
        } catch(error) {
            console.log(errors); 
            res.status(500).send('internal server error')
        }
     }
}
 
module.exports = {product}