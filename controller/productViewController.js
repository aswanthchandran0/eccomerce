const productData= require('../models/productModel')
const cartData = require('../models/cartModel')
const wishlistData = require('../models/wishlistModel')
const productViewAll = {
     productView : async (req,res)=>{
      try{
        
        const productId = req.query.id
        const user = req.session.user
        let userId
        let isProductinCart
        let isProductinWishlist
        if(user !== null && user !==undefined){
          userId = req.session.user._id
        }
          if(userId !==null && userId !==undefined){
             const  userCart = await cartData.find({userId:userId})
             const userWishlist = await wishlistData.find({userId:userId})
             isProductinCart = userCart.some((product)=>product.products.some(product => product.productId === productId))
             isProductinWishlist = userWishlist.some((product)=>product.products.some(product => product.productId === productId))
            
          }
        const product = await productData.findOne({_id:productId})
        const productCategory = product.Catagory
         console.log('category',productCategory);
        const categorisedProducts = await productData.find({Catagory:productCategory, _id:{$ne:productId}})
        console.log('categorised product',categorisedProducts);
        if (product) {
          res.render('productView', { product: product,categorisedProducts:categorisedProducts ,isProductinCart, isProductinWishlist,currentPage:''});

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