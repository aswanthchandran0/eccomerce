const product = require('../models/productModel')

const cart = {
 cartPage: async (req,res)=>{
    res.render('cart')
 },
 addToCart : async (req,res)=>{
  const productId = req.body.productId
  
  try{
   const productDetails = await product.findById(productId)

   if (!productDetails) {
      return res.status(404).json({ success: false, message: 'Product not found' });
  }
  let cart = req.session.cart || new Cart();

  cart.addProduct({
   productId: productDetails._id,
   productName: productDetails.ProductName,
   price: productDetails.ProductPrice,
   quantity: 1,
});

req.session.cart = cart;

res.json({ success: true, message: 'Product added to cart successfully', cart: cart });

  }catch(error){
   console.error(error);
   res.status(500).json({ success: false, message: 'Internal server error' });
  }
 }
}


module.exports = {cart}