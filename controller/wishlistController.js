const wishListData = require('../models/wishlistModel')
const product = require('../models/productModel')
const cartModel = require('../models/cartModel')
const mongoose = require('mongoose')

const wishList = {
  wishlistPage: async(req,res)=>{
    try{
      const userId = req.session.user._id
      const userWishlist = await wishListData.findOne({userId:userId})
      let userCart
      let products = []
      
      if(userWishlist && userWishlist.products.length > 0){
        // Get product IDs from wishlist
        const productIds = userWishlist.products.map(item => new mongoose.Types.ObjectId(item.productId));
        
        // Fetch all product details
        products = await product.find({ _id: { $in: productIds } });
        
        // Get user cart
        userCart = await cartModel.findOne({userId:userId})
      }
      
      res.render('wishlist',{
        products, 
        userCart, 
        currentPage:'wishlist',
        userId: userId
      })  
     
    }catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
  },
  
  addToWishlist: async(req,res)=>{
    try{
      const user = req.session.user
      const productId = req.body.productId 
      
      if(!user || !user._id){
        return res.json({notLoggedIn:true})
      }
      
      const userId = user._id
      const existingProduct = await wishListData.findOne({
        userId:userId,
        'products.productId': productId,
      })
      
      if (existingProduct) {
        return res.json({productExist:true})
      }

      await wishListData.updateOne(
        { userId: userId },
        { $addToSet: { products: { productId: productId } } },
        { upsert: true }
      )
            
      res.json({success:true})
          
    }catch(error){
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },
  
  delete: async(req,res)=>{
    try{
      const userId = req.session.user._id
      const productId = req.params.productId
      
      await wishListData.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }
      )
      
      res.redirect('/wishlist')
    }catch(error){
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = {wishList}