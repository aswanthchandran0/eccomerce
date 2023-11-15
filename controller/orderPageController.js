const addressModel = require('../models/userAddressModel')
const cartModel = require('../models/cartModel')
const product = require('../models/productModel')
const orderModel = require('../models/orderModel')
const  {isValidpaymentMethod,isValidselectedAddressId} = require('../validators/orderVaidation')
const RazorPay = require('../paymentGateway/RazorPay')
const { response } = require('express')

const order = {
    orderPage: async (req,res)=>{
        try{ 
          console.log('Start of order controller');
            const userId = req.session.user._id
            const address = await addressModel.findOne({user:userId})
            const userCart = await cartModel.findOne({userId:userId})
            console.log('cartmodel'+userCart);
            console.log(address);
           const productId =  userCart.products.map(product => product.productId)
           console.log(productId);
           const products = await product.find({_id:{$in:productId}})
           const productPrice = products.map(product => product.ProductPrice)
           const quantities = userCart.products.map(product => product.quantity);
           const shippingPrice = userCart ? userCart.shippingPrice : 0;
           console.log(shippingPrice);          


      const totalPriceArray = [];
      const individualTotalArray = [];
 
          let totalPrice = 0
          for(let i =0;i<products.length;i++){
            const individualTotal = productPrice[i] * quantities[i];
        totalPrice += individualTotal;

        individualTotalArray.push(individualTotal);
        totalPriceArray.push(totalPrice);
          }
        const allTotal = totalPrice+shippingPrice
          console.log('total price'+totalPrice); 

              res.render('orderPage',{address,products,totalPrice, individualTotalArray,totalPriceArray,shippingPrice,allTotal})
        }catch(error){
            console.log(error); 
            res.status(500).send('internal server error')
        }
    } ,
    order: async (req,res)=>{
        const userId= req.session.user._id 
        const selectedAddressId = req.body.selectedAddressId;
        const paymentMethod = req.body.paymentMethod

        console.log('selected address'+ selectedAddressId+'payment methord'+paymentMethod);
        const userAddress = await addressModel.findOne(
            { user: userId, 'address._id': selectedAddressId},
            { 'address.$': 1 }
        ); 
 
        try{
                 const userCart =await cartModel.findOne({userId})
            const productId =  userCart.products.map(product => product.productId)
            const products = await product.find({_id:{$in:productId}})
            const productPrice = products.map(product => product.ProductPrice)
            const quantities = userCart.products.map(product => product.quantity);
            const shippingPrice = userCart ? userCart.shippingPrice : 0;
           const currentDate = new Date();
            const totalPriceArray = [];
            const individualTotalArray = [];
    
            let subTotalPrice = 0 
            for(let i =0;i<products.length;i++){
              const individualTotal = productPrice[i] * quantities[i];
          subTotalPrice += individualTotal;
    
          individualTotalArray.push(individualTotal);
          totalPriceArray.push(subTotalPrice);
            } 
          const totalPrice = subTotalPrice+shippingPrice
            console.log('sub total price in order'+subTotalPrice); 
            console.log('total price in the order'+totalPrice);
                
            const daddress = { 
                Fname: userAddress.address[0].Fname,
                Email: userAddress.address[0].Email,
                PhoneNumber: userAddress.address[0].PhoneNumber,
                Pincode: userAddress.address[0].Pincode,
                Address: userAddress.address[0].Address,
                Place: userAddress.address[0].Place,
                state: userAddress.address[0].state,
                LandMark: userAddress.address[0].LandMark,
                AphoneNumber: userAddress.address[0].AphoneNumber,
                AddressType: userAddress.address[0].AddressType,
              };
    
            console.log('daddress'+daddress);
    
            const newOrder = await new orderModel({
                userId:  userId,
                productId: productId ,
                address: daddress, 
                shippingPrice: shippingPrice,
                Total: totalPrice,
                paymentMethod: paymentMethod,
                orderDate:currentDate,
    
            })
          
            await newOrder.save()
            await cartModel.updateOne({ userId }, { $unset: { products: 1 } });
             
            const orderId = newOrder._id
            if( paymentMethod === 'Cash on Delivery'){
                 res.json({codSucess:true})
            }
            else if(paymentMethod === 'Online Payment'){
             const response = await RazorPay.paymentGateway.generateRazorPay(orderId,Number(totalPrice))
             console.log('response...............................'+response);

             res.json({
              success: true,
              message: 'Razorpay order created successfully',
              data: response,
            });
            }
            else{
              res.redirect('/orderSucess')      
            }
          
        
    
       
        }catch(error){
          console.log(error);
          res.status(500).send('internal server error')
        }

       
    } ,
    verfiyPayment: async (req,res)=>{
      console.log('request reached in verify payment'+req.body);
    }
}


module.exports = {order} 