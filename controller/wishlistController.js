const wishListData = require('../models/wishlistModel')
const product = require('../models/productModel')
const cartModel = require('../models/cartModel')
const wishList = {
  wishlistPage: async(req,res)=>{
    try{
     if(req.session.user){
      const userId = req.session.user._id
      const userWishlist = await wishListData.findOne({userId:userId})
      let userCart
      let products
      let productIds
      if(userWishlist){
        for(i=0;i<userWishlist.products.length;i++){
          productIds = userWishlist.products.map(product => product.productId);
        products = await product.find({ _id: { $in: productIds } });
      
        }
        userCart = await cartModel.findOne({userId:userId})
        console.log('user cart',userCart);
      }
      if(products){
        res.render('wishlist',{products,userCart,currentPage:'wishlist'})  
      }else{
        res.render('wishlist',{products:'',currentPage:'wishlist'})
      }
     }else{
      res.redirect('/login')
     }
    }catch(error){
        console.log(error);
        res.status(500)
    }
  },
  addToWishlist:async(req,res)=>{
    try{
          const user = req.session.user

        
          const productId = req.body.productId 
           if(user !== null && user !== undefined){
            const userId = req.session.user._id
            const existingProduct = await wishListData.findOne({
              userId:userId,
              'products.productId': productId,
             })
        
            
             if (existingProduct) {

              return res.json({productExist:true})
          }


            const newWishlist = await wishListData.updateOne(
              { userId: userId },
              {
                $addToSet: { products: { productId: productId, } },
              },
              { upsert: true }
            )
                  
            res.json({success:true})
           }else{
            
            return res.json({notLoggedIn:true})
           }
          
          
    }catch(error){
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },
  delete: async(req,res)=>{
    try{
      const userId = req.session.user._id
      const productId = req.params.productId
      const wishListDelete = await wishListData.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }
      )
      res.redirect('/wishlist')
    }catch(error){

    }
  
  }
}


module.exports = {wishList}