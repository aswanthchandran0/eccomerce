const product = require('../models/productModel')
const cartModel = require('../models/cartModel');
const { urlencoded } = require('express');
const mongoose = require("mongoose");
const cart = {


  
cartPage: async (req, res) => {
  try {
    const empty = req.query.empty;
    const error = req.query.error
      ? JSON.parse(decodeURIComponent(req.query.error))
      : null;

    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    // Populate product details directly
    const userCart = await cartModel
      .findOne({ userId })
      .populate("products.productId"); // <-- auto fetch product details

    let products = [];
    let totalPrice = 0;

    if (userCart && userCart.products.length) {
      products = userCart.products.map((item) => {
        const productData = item.productId; // populated product
        const qty = item.quantity || 0;

        const price = productData?.price
          ? parseFloat(productData.price.toString()) // handle Decimal128
          : 0;

        const total = price * qty;
        totalPrice += total;

        return {
          _id: productData._id,
          name: productData.name,
          price,
          quantity: qty,
          images: productData.images || [],
          total,
        };
      });
    }

    res.render("cart", {
      userCart,
      products,
      totalPrice,
      error,
      empty,
      currentPage: "cart",
    });
  } catch (error) {
    console.error("Cart page error:", error);
    res.status(500).send("Internal Server Error");
  }
},



  addToCart: async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ notLoggedIn: true });
    }

    const productId = req.body.productId;
    const userId = req.session.user._id;

    // Ensure IDs are ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check product info
    const productinfo = await product.findById(productObjectId);
    if (!productinfo) {
      return res.json({ success: false, message: "Product not found" });
    }

    console.log("Product info", productinfo);
    console.log("Stock", productinfo.variants?.reduce((sum, v) => sum + v.stock, 0));

    // Example: checking total stock across variants
    const totalStock = productinfo.variants.reduce((sum, v) => sum + v.stock, 0);
    if (totalStock <= 0) {
      return res.json({ outOfStock: true });
    }

    // Check if product already in cart
    const existingProduct = await cartModel.findOne({
      userId: userObjectId,
      "products.productId": productObjectId,
    });

    if (existingProduct) {
      return res.json({ productExist: true });
    }

    // Add product to cart
    await cartModel.updateOne(
      { userId: userObjectId },
      { $addToSet: { products: { productId: productObjectId, quantity: 1 } } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.json({ success: false });
  }
},



// ✅ Update cart quantity & totals
updateTotalPrice: async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    // update quantity
    const updatedCart = await cartModel.findOneAndUpdate(
      { userId, "products.productId": productId },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    ).populate("products.productId");

    if (!updatedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // recalc totals
    let cartTotal = 0;
    updatedCart.products.forEach((item) => {
      const price = item.productId?.price
        ? parseFloat(item.productId.price.toString())
        : 0;
      cartTotal += (item.quantity || 0) * price;
    });

    const updatedItem = updatedCart.products.find(
      (p) => p.productId._id.toString() === productId.toString()
    );

    const totalPrice = updatedItem
      ? updatedItem.quantity *
        parseFloat(updatedItem.productId.price.toString())
      : 0;

    res.json({ totalPrice, cartTotal, productId });
  } catch (error) {
    console.error("updateTotalPrice error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
},

// ✅ Remove product from cart
deleteCart: async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user._id);
    const productId = new mongoose.Types.ObjectId(req.query.id);

    await cartModel.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("deleteCart error:", error);
    res.status(500).send("internal server error");
  }
},

// ✅ Increment/decrement quantity
updatePrice: async (req, res) => {
  try {
    const quantityChange = parseInt(req.params.quantityChange);
    const productId = new mongoose.Types.ObjectId(req.params.productId);
    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    const cart = await cartModel.findOne({ userId }).populate("products.productId");
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (item) => item.productId._id.toString() === productId.toString()
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not in cart" });
    }

    cart.products[productIndex].quantity += quantityChange;
    cart.products[productIndex].quantity = Math.max(
      cart.products[productIndex].quantity,
      1
    );

    await cart.save();

    const price = parseFloat(cart.products[productIndex].productId.price.toString());
    const totalPrice = price * cart.products[productIndex].quantity;
    const updatedQuantity = cart.products[productIndex].quantity;

    res.json({ quantity: updatedQuantity, totalPrice });
  } catch (error) {
    console.error("updatePrice error:", error);
    res.status(500).send("internal server error");
  }
},

// ✅ Save order data in session
orderData: async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user._id);
    const { totalPrice, subtotalPrice, shippingPrice, quantity } = req.body;

    req.session.orderData = {
      userId,
      totalPrice,
      subtotalPrice,
      shippingPrice,
      quantity,
    };

    res.json({ success: true });
  } catch (error) {
    console.error("orderData error:", error);
    res.status(500).send("internal server error");
  }
},

// ✅ Update shipping price
shippingPrice: async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user._id);
    const shippingValue = req.body.shippingValue;

    await cartModel.findOneAndUpdate(
      { userId },
      { shippingPrice: shippingValue }
    );

    res.json({
      status: "success",
      message: "Shipping price received on the server.",
    });
  } catch (error) {
    console.error("shippingPrice error:", error);
    res.status(500).send("internal server error");
  }
},

// ✅ Validate stock before checkout
processToCheckout: async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user._id);
    const userCart = await cartModel.findOne({ userId });

    if (!userCart || userCart.products.length === 0) {
      return res.redirect("/cart?empty=" + encodeURIComponent(true));
    }

    const cartProductInfo = await Promise.all(
      userCart.products.map(async (info) => {
        const productInfo = await product.findById(info.productId);

        if (!productInfo) return null;

        const totalStock = productInfo.variants.reduce(
          (sum, variant) => sum + (variant.stock || 0),
          0
        );

        return {
          productId: info.productId,
          totalStock,
          quantity: info.quantity || 0,
          productName: productInfo.name,
        };
      })
    );

    const errors = cartProductInfo
      .filter((item) => item && item.quantity > item.totalStock)
      .map((item) => ({
        productId: item.productId,
        error: "not enough stock",
        productName: item.productName,
      }));

    if (errors.length > 0) {
      const errorsString = encodeURIComponent(JSON.stringify(errors));
      return res.redirect(`/cart?error=${errorsString}`);
    }

    res.redirect("/order");
  } catch (error) {
    console.error("processToCheckout error:", error);
    res.status(500).send("internal server error");
  }
},
  // cartPage: async (req, res) => {
  //   try {
  //     const empty = req.query.empty;
  //     const error = req.query.error ? JSON.parse(decodeURIComponent(req.query.error)) : null;

  //     const userCart = await cartModel.findOne({ userId: req.session.user._id });
  
  //     let products = null;
  //     let totalPrice = 0;

  //     if (userCart) {
  //       const productIds = userCart.products.map(product => product.productId);
  //       products = await product.find({ _id: { $in: productIds } });

  //       products.forEach((product) => {
  //         const cartProduct = userCart.products.find((p) => p.productId === product._id.toString());
  //         if (cartProduct) {
  //           totalPrice += product.price * cartProduct.quantity;
  //           product.quantity = cartProduct.quantity;
  //         }
  //       });
  //     }

  //     res.render('cart', { userCart, products, totalPrice, error, empty, currentPage: 'cart' });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // },




  // addToCart: async (req, res) => {

  //   if (req.session.user) {
  //     const productId = req.body.productId
  //     const userId = req.session.user._id
  //     const productinfo = await product.findOne({_id:productId})
  
  //       const productObjectId = new mongoose.Types.ObjectId(productId);
  //   const userObjectId = new mongoose.Types.ObjectId(userId);

  //     if(productinfo.ProductCount == 0){
  //       console.log('request reaching inside the out of stock condition');
  //       return res.json({outOfStock:true})
  //     }
  //    const existingProduct = await cartModel.findOne({
  //     userId:userId,
  //     'products.productId': productId,
  //    })

    
  //    if (existingProduct) {
  //     return res.json({productExist:true})
  // }

  //     try { 

  //       const newCart = await cartModel.updateOne(
  //         { userId: userId },
  //         {
  //           $addToSet: { products: { productId: productId, quantity: 1 } },
  //         },
  //         { upsert: true }
  //       )


  //       res.json({success:true})
  //     } catch (error) {
  //       console.log(error);
  //       res.json({success:false})
  //     }
  //   }
  //   else {
  //     return res.json({notLoggedIn:true})
  //   }


  // },
//   updateTotalPrice: async (req, res) => {
//     const { productId, quantity, productPrice } = req.body;
//     const totalPrice = quantity * productPrice;
        
//     try {

//       const updatedCart = await cartModel.findOneAndUpdate(
//         { userId: req.session.user._id, 'products.productId': productId },
//         { $set: { 'products.$.quantity': quantity } },
//         { new: true }
//       );

//       let cartTotal = 0;
//       updatedCart.products.forEach(product => {
//         cartTotal += product.quantity * parseFloat(productPrice);
//       });
//            const cartData = await cartModel.find({userId:userId})
//            console.log('cartData',cartData);
//            console.log('totalPrice',totalPrice);
//            console.log('cartTotal',cartTotal);
//            console.log('productiD',productId);
//       res.json({ totalPrice, cartTotal, productId });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//     // res.json({ totalPrice,input });
//   },

//   deleteCart: async (req, res) => {
   
//     const userId = req.session.user._id 
//     const productId = req.query.id
   
  
//     try {
//       const cdelete = await cartModel.findOneAndUpdate(
//         { userId: userId },
//         { $pull: { products: { productId: productId } } },
//         { new: true }

//       )
//       res.json({success:true})
//     } catch (error) {
//       console.log(error)
//       res.status(500).send('internal server error')
//     }


//   },

//   updatePrice: async (req, res) => {
//     let quantityChange = parseInt(req.params.quantityChange)
//     let productId = req.params.productId
//     const user = req.session.user
//     let userId
//     if(user !==null && user !== undefined){
//        userId = user._id
//     } 
//     let productPrice = parseFloat(req.params.productPrice)
//     const cart = await cartModel.findOne({userId:req.session.user._id})
//     const productIndex = cart.products.findIndex(product => product.productId === productId);
//      const shippingPrice = req.query.shippingPrice

  
//     if(productIndex !== -1){ 
//       cart.products[productIndex].quantity += quantityChange;
//       cart.products[productIndex].quantity = Math.max(cart.products[productIndex].quantity, 1);
      


//       await cartModel.findOneAndUpdate({ userId: req.session.user._id }, { products: cart.products },{ new: true } );

//     const totalPrice = productPrice* cart.products[productIndex].quantity
//     const updatedQuantity = cart.products[productIndex].quantity;
//       res.json({quantity: updatedQuantity,totalPrice });
//     }  
   
//   },
//   orderData: async (req,res)=>{
//      try{
//       const userId = req.session.user._id;
//       const totalPrice = req.body.totalPrice; 
//       const subtotalPrice = req.body.subtotalPrice; 
//       const shippingPrice = req.body.shippingPrice; 
//       const quantity = req.body.quantity; 

     

//       req.session.orderData = {
//         userId: userId,
//         totalPrice: totalPrice,
//         subtotalPrice: subtotalPrice,
//         shippingPrice: shippingPrice,
//         quantity: quantity,
//     };
 


    

//      }catch(error){
//       console.log(error);
//       res.status(500).send('internal server error')
//      }
//   },
// shippingPrice: async (req,res)=>{
//      try{
//       const shippingValue = req.body.shippingValue;
//        const updatedCart = await cartModel.findOneAndUpdate({userId:req.session.user._id},
//          { shippingPrice: shippingValue}
//          )
     
         
//        res.json({ status: 'success', message: 'Shipping price received on the server.' });
//      }catch(error){
//       console.log(error);
//       res.status(500)
//      }
  
// },
// processToCheckout: async (req, res) => {
//   try {
//     const userId = req.session.user._id;
//     const userCart = await cartModel.findOne({ userId: userId });

//     if (!userCart || userCart.products.length === 0) {
//       const error = true;
//       return res.redirect('/cart?empty=' + encodeURIComponent(error));
//     }

//     // Build cart product info with stock check
//     const cartProductInfo = await Promise.all(
//       userCart.products.map(async (info) => {
//         const productInfo = await product.findById(info.productId);

//         if (!productInfo) {
//           return null; // product not found
//         }

//         // 🔥 Sum all variant stock
//         const totalStock = productInfo.variants.reduce(
//           (sum, variant) => sum + (variant.stock || 0),
//           0
//         );

//         return {
//           productId: info.productId,
//           totalStock: totalStock,
//           quantity: info.quantity || 0,
//           productName: productInfo.name
//         };
//       })
//     );

//     let errors = [];

//     for (let i = 0; i < cartProductInfo.length; i++) {
//       const item = cartProductInfo[i];
//       if (!item) continue; // skip null products

//       if (item.quantity > item.totalStock) {
//         errors.push({
//           productId: item.productId,
//           error: 'not enough stock',
//           productName: item.productName
//         });
//       }
//     }

//     if (errors.length > 0) {
//       const errorsString = encodeURIComponent(JSON.stringify(errors));
//       return res.redirect(`/cart?error=${errorsString}`);
//     } else {
//       return res.redirect('/order');
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('internal server error');
//   }
// }
}


module.exports = { cart }