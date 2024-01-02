const product = require('../models/productModel')
const cartModel = require('../models/cartModel');
const { urlencoded } = require('express');
const cart = {

  cartPage: async (req, res) => {
    try {
      const empty = req.query.empty;
      const error = req.query.error ? JSON.parse(decodeURIComponent(req.query.error)) : null;

      const userCart = await cartModel.findOne({ userId: req.session.user._id });
  
      let products = null;
      let totalPrice = 0;

      if (userCart) {
        const productIds = userCart.products.map(product => product.productId);
        products = await product.find({ _id: { $in: productIds } });

        products.forEach((product) => {
          const cartProduct = userCart.products.find((p) => p.productId === product._id.toString());
          if (cartProduct) {
            totalPrice += product.ProductPrice * cartProduct.quantity;
            product.quantity = cartProduct.quantity;
          }
        });
      }

      res.render('cart', { userCart, products, totalPrice, error, empty, currentPage: 'cart' });
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  },






  addToCart: async (req, res) => {

    if (req.session.user) {
      const productId = req.body.productId
      const userId = req.session.user._id
     const existingProduct = await cartModel.findOne({
      userId:userId,
      'products.productId': productId,
     })

    
     if (existingProduct) {
      return res.json({productExist:true})
  }

      try { 

        const newCart = await cartModel.updateOne(
          { userId: userId },
          {
            $addToSet: { products: { productId: productId, quantity: 1 } },
          },
          { upsert: true }
        )


        res.json({success:true})
      } catch (error) {
        console.log(error);
        res.json({success:false})
      }
    }
    else {
      return res.json({notLoggedIn:true})
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
           const cartData = await cartModel.find({userId:userId})
           console.log('cartData',cartData);
           console.log('totalPrice',totalPrice);
           console.log('cartTotal',cartTotal);
           console.log('productiD',productId);
      res.json({ totalPrice, cartTotal, productId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    // res.json({ totalPrice,input });
  },

  deleteCart: async (req, res) => {
   
    const userId = req.session.user._id 
    const productId = req.query.id
   
  
    try {
      const cdelete = await cartModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }

      )
      res.json({success:true})
    } catch (error) {
      console.log(error)
      res.status(500).send('internal server error')
    }


  },

  updatePrice: async (req, res) => {
    let quantityChange = parseInt(req.params.quantityChange)
    let productId = req.params.productId
    const user = req.session.user
    let userId
    if(user !==null && user !== undefined){
       userId = user._id
    } 
    let productPrice = parseFloat(req.params.productPrice)
    const cart = await cartModel.findOne({userId:req.session.user._id})
    const productIndex = cart.products.findIndex(product => product.productId === productId);
     const shippingPrice = req.query.shippingPrice

  
    if(productIndex !== -1){ 
      cart.products[productIndex].quantity += quantityChange;
      cart.products[productIndex].quantity = Math.max(cart.products[productIndex].quantity, 1);
      


      await cartModel.findOneAndUpdate({ userId: req.session.user._id }, { products: cart.products },{ new: true } );

    const totalPrice = productPrice* cart.products[productIndex].quantity
    const updatedQuantity = cart.products[productIndex].quantity;
      res.json({quantity: updatedQuantity,totalPrice });
    }  
   
  },
  orderData: async (req,res)=>{
     try{
      const userId = req.session.user._id;
      const totalPrice = req.body.totalPrice; 
      const subtotalPrice = req.body.subtotalPrice; 
      const shippingPrice = req.body.shippingPrice; 
      const quantity = req.body.quantity; 

     

      req.session.orderData = {
        userId: userId,
        totalPrice: totalPrice,
        subtotalPrice: subtotalPrice,
        shippingPrice: shippingPrice,
        quantity: quantity,
    };
 


    

     }catch(error){
      console.log(error);
      res.status(500).send('internal server error')
     }
  },
shippingPrice: async (req,res)=>{
     try{
      const shippingValue = req.body.shippingValue;
       const updatedCart = await cartModel.findOneAndUpdate({userId:req.session.user._id},
         { shippingPrice: shippingValue}
         )
     
         
       res.json({ status: 'success', message: 'Shipping price received on the server.' });
     }catch(error){
      console.log(error);
      res.status(500)
     }
  
},
processToCheckout: async(req,res)=>{
  try{
    let cartProductInfo = []
  const userId = req.session.user._id
  const userCart = await cartModel.findOne({userId:userId})
  if(userCart.products.length ==0){

    const error = true
    return res.redirect('/cart?empty='+ urlencoded(error))
  }
     cartProductInfo = await Promise.all(
     userCart.products.map(async (info)=>{
      const productInfo = await product.findOne({_id:info.productId})
     

      if (!productInfo) {
        // Handle the case where productInfo is null (product not found)
        return null; // or handle it according to your application logic
      }


      return {
        productId: info.productId,
        productCount: productInfo.ProductCount || 0, 
        quantity: info.quantity || 0, 
      };

    
     })
 )
  
 let item
let errors = []
for(let i=0;i<cartProductInfo.length;i++){
  if(cartProductInfo[i].quantity > cartProductInfo[i].productCount){
     item = await product.findOne({_id:cartProductInfo[i].productId})
   errors.push({productId:cartProductInfo[i].productId,error:'not enough stock',productName:item.ProductName})
   
  }
}

if(errors.length>0){
  const errorsString = encodeURIComponent(JSON.stringify(errors));
  await res.redirect(`/cart?error=${errorsString}`);
}else{
  res.redirect('/order')
}

  }catch(error){
    console.log(error)
    res.status(500).send('internal server error') 
  }
  

}


}


module.exports = { cart }