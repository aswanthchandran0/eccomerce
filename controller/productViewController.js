const Product= require('../models/productModel')
const Cart = require('../models/cartModel')
const Wishlist = require('../models/wishlistModel')
const productViewAll = {
      productView: async (req, res,next) => {
    try {
      console.log("Request reached productView...");

      const productId = req.query.id;
      if (!productId) {
        return res.status(400).send("Product ID is required");
      }

      const user = req.session.user;
      let isProductinCart = false;
      let isProductinWishlist = false;

      // ✅ Find product with populated category + brand
      const product = await Product.findById(productId)
        .populate("category", "name")
        .populate("brand", "name");

      if (!product) {
        return res.status(404).send("Product not found");
      }

      // ✅ If user logged in, check cart + wishlist
      if (user?._id) {
        const userId = user._id;

        const userCart = await Cart.findOne({ userId });
        const userWishlist = await Wishlist.findOne({ userId });

        isProductinCart = userCart?.products.some(
          (p) => p.productId.toString() === productId
        ) || false;

        isProductinWishlist = userWishlist?.products.some(
          (p) => p.productId.toString() === productId
        ) || false;
      }

      // ✅ Find related products by category (exclude current one)
      const categorisedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: productId },
        isActive: true,
      }).limit(8);

      // ✅ Render view
      res.render("productView", {
        product,
        categorisedProducts,
        isProductinCart,
        isProductinWishlist,
        currentPage: "",
      });

    } catch (err) {
     err.function = 'productView',
     next(err)
    }
  },
} 
 

module.exports ={productViewAll} 