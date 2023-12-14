const ProductDetails = require('../models/productModel');
const model = require('../models/productModel')
const fs = require('fs')

const product = {
     getAllProduct: async (req,res)=>{ 
        const productData=  await model.find()
        console.log(productData);   
        res.render('productDetails',{productData}) 
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