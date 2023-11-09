const product = require('../models/productModel')
const cartModel = require('../models/cartModel');

const cart = {
  cartPage: async (req, res) => {
    try {
      const userCart = await cartModel.findOne({ userId: req.session.user._id });
      let products = null;
      let totalPrice = 0;

      if (userCart) {
        for (let i = 0; i < userCart.products.length; i++) {
          const cartProduct = userCart.products[i];
          const productData = await product.findOne({ _id: cartProduct.productId });
          console.log(productData);
          console.log(cartProduct);
          if (productData) {
            totalPrice += productData.ProductPrice * cartProduct.quantity;
          }
        }

        const productIds = userCart.products.map(product => product.productId);
        products = await product.find({ _id: { $in: productIds } });
      }

      if (products) {
        res.render('cart', { products, totalPrice });
      } else {
        res.render('cart', { products: null });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },




  addToCart: async (req, res) => {

    if (req.session.user) {
      const productId = req.params.id
      const userId = req.session.user._id


      try {

        const newCart = await cartModel.updateOne(
          { userId: userId },
          {
            $addToSet: { products: { productId: productId, quantity: 1 } },
          },
          { upsert: true }
        )


        res.redirect('/')
      } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error')
      }
    }
    else {
      res.redirect('/login')
    }


  },
  updateTotalPrice: async (req, res) => {

    const { productId, quantity, productPrice } = req.body;
    const totalPrice = quantity * productPrice;

    try {

      const updatedCart = await cartModel.findOneAndUpdate(
        { userId: req.session.user._id, 'products.productId': productId },
        { $set: { 'products.$.quantity': quantity } },
        { new: true }
      );


      let cartTotal = 0;
      updatedCart.products.forEach(product => {
        cartTotal += product.quantity * parseFloat(productPrice);
      });

      res.json({ totalPrice, cartTotal, productId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    // res.json({ totalPrice,input });
  },

  deleteCart: async (req, res) => {
    console.log('Delete cart request received.');
    const userId = req.session.user._id
    const productId = req.params.id
    console.log('userid: ' + userId + 'productid :' + productId);
    try {
      const cdelete = await cartModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }

      )


      console.log('delete cart' + cdelete);
      res.redirect('/cart')
    } catch (error) {
      console.log(error)
      res.status(500).send('internal server error')
    }


  },

  updatePrice: async (req, res) => {
    let quantityChange = parseInt(req.params.quantityChange)
    let productId = req.params.productId
    let productPrice = parseFloat(req.params.productPrice)
    const cart = await cartModel.findOne({userId:req.session.user._id})
    const productIndex = cart.products.findIndex(product => product.productId === productId);
    console.log('productIndex'+productIndex);
     
  
    if(productIndex !== -1){
      cart.products[productIndex].quantity += quantityChange;
      cart.products[productIndex].quantity = Math.max(cart.products[productIndex].quantity, 1);
      
console.log("cart quantity"+cart.products[productIndex].quantity);

      await cartModel.findOneAndUpdate({ userId: req.session.user._id }, { products: cart.products },{ new: true } );

    const totalPrice = productPrice* cart.products[productIndex].quantity
    const updatedQuantity = cart.products[productIndex].quantity;
    console.log('totalprice'+ totalPrice);
    
      res.json({quantity: updatedQuantity,totalPrice });
    }
    /*const updatedCart = await cartModel.findOneAndUpdate(
      { userId: req.session.user._id, 'products.productId': productId },
      { $set: { 'products.$.quantity': quantity } },
      { new: true }
    );

    */

    //let totalPrice = productPrice * quantityChange

  //  console.log('quantity' + quantity);
    console.log('productId' + productId);
    console.log('productPrice' + productPrice);

  //  res.json({ totalPrice })
  }



}


module.exports = { cart }