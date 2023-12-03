const productData= require('../models/productModel')

const productViewAll = {
     productView : async (req,res)=>{
      try{

        const productId = req.query.id
        const product = await productData.findOne({_id:productId})
        const productCategory = product.Catagory
         console.log('category',productCategory);
        const categorisedProducts = await productData.find({Catagory:productCategory, _id:{$ne:productId}})
        console.log('categorised product',categorisedProducts);
        if (product) {
          res.render('productView', { product: product,categorisedProducts:categorisedProducts });

      } else {
          
          res.send('Product not found');
      }
      }catch(error){
        console.log(error);
        res.status(500)
      }
      
     } 
} 
 

module.exports ={productViewAll} 