const product = require('../models/productModel')
const cartModel = require('../models/cartModel');
const { urlencoded } = require('express');
const cart = {
  cartPage: async (req, res) => {
    try {
      if(!req.session.user._id ){
        res.redirect('/')
      }
     
      const empty = req.query.empty
        let error = req.query.error ? JSON.parse(decodeURIComponent(req.query.error)) : null;
      console.log(`errors in cart page: ${JSON.stringify(error)}`);

      const userCart = await cartModel.findOne({ userId: req.session.user._id });
      console.log('usercart',userCart);
      let products = null;
      let totalPrice = 0;
      let quantity
      if (userCart) {
        for (let i = 0; i < userCart.products.length; i++) {
          const cartProduct = userCart.products[i];
          const productData = await product.findOne({ _id: cartProduct.productId });
           console.log('cart product',cartProduct);
           console.log('prodouct data',productData);
          if (productData) {
            totalPrice += productData.ProductPrice * cartProduct.quantity;
          }
          quantity= cartProduct.quantity
        }
          
        const productIds = userCart.products.map(product => product.productId);
        products = await product.find({ _id: { $in: productIds } });
      }

      if (products) {
        if(error){
          console.log('errors reached'+error);
          res.render('cart', { products, totalPrice: totalPrice ,error,empty});
        
        }else{
        res.render('cart', { products, totalPrice: totalPrice ,error:null});
        }
      } else {
        res.render('cart', { products: null });
      }
    } catch (error) {
      console.log(error);
      res.status(500)
    }
  },




  addToCart: async (req, res) => {

    if (req.session.user) {
      const productId = req.params.id
      const userId = req.session.user._id
     const existingProduct = await cartModel.findOne({
      userId:userId,
      'products.productId': productId,
     })

    
     if (existingProduct) {
      console.log('Product already exists in the cart.');
      return res.redirect('/');
  }

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
      console.log('productId in updateTotalPrice ',productId);
      console.log('quantity in updateTotalPrice ',quantity);
      console.log('productPrice in updateTotalPrice ',productPrice);

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
   
    const userId = req.session.user._id 
    const productId = req.params.id
  
    try {
      const cdelete = await cartModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }

      )
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
     const shippingPrice = req.query.shippingPrice
    
  
    if(productIndex !== -1){ 
      cart.products[productIndex].quantity += quantityChange;
      cart.products[productIndex].quantity = Math.max(cart.products[productIndex].quantity, 1);
      


      await cartModel.findOneAndUpdate({ userId: req.session.user._id }, { products: cart.products },{ new: true } );

    const totalPrice = productPrice* cart.products[productIndex].quantity
    const updatedQuantity = cart.products[productIndex].quantity;
      
    console.log('totalPrice in updatePrice',totalPrice);
    console.log('updatedQuantity in updatePrice',updatedQuantity);
      res.json({quantity: updatedQuantity,totalPrice });
    }  
   
  },
  orderData: async (req,res)=>{
    console.log('request reached');
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
      console.log('shipping price',shippingValue);
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
  console.log('user cart ',userCart);
  if(userCart.products.length ==0){

    console.log('request reached inside this');
    const error = true
    return res.redirect('/cart?empty='+ urlencoded(error))
  }
     cartProductInfo = await Promise.all(
     userCart.products.map(async (info)=>{
      const productInfo = await product.findOne({_id:info.productId})
     

      if (!productInfo) {
        // Handle the case where productInfo is null (product not found)
        console.log(`Product not found for productId: ${info.productId}`);
        return null; // or handle it according to your application logic
      }


      return {
        productId: info.productId,
        productCount: productInfo.ProductCount || 0, 
        quantity: info.quantity || 0, 
      };

    
     })
 )
  
 console.log('cartProductInfo', cartProductInfo);
 let item
let errors = []
console.log('cart info length',cartProductInfo.length);
for(let i=0;i<cartProductInfo.length;i++){
  console.log('request reached inside the loop');
  if(cartProductInfo[i].quantity > cartProductInfo[i].productCount){
     item = await product.findOne({_id:cartProductInfo[i].productId})
   errors.push({productId:cartProductInfo[i].productId,error:'not enough stock',productName:item.ProductName})
   
  }
}

if(errors.length>0){
  console.log('request reached in the if condition');
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