const wishListData = require('../models/wishlistModel')
const product = require('../models/productModel')
const wishList = {
  wishlistPage: async(req,res)=>{
    try{
     if(req.session.user){
      console.log('request reached');
      const userId = req.session.user._id
      const userWishlist = await wishListData.findOne({userId:userId})
      let products
      if(userWishlist){
        for(i=0;i<userWishlist.products.length;i++){
          const productIds = userWishlist.products.map(product => product.productId);
        products = await product.find({ _id: { $in: productIds } });
        }
      }
      if(products){
        res.render('wishlist',{products})  
      }else{
        res.render('wishlist',{products:''})
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
          const userId = req.session.user._id
          const productId = req.body.productId 
           if(userId){

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
                  
            console.log('wishlist',newWishlist);
            res.json({success:true})
           }else{
            res.json({success:false})
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