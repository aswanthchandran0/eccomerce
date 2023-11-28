const addressModel = require('../models/userAddressModel')
const cartModel = require('../models/cartModel')
const product = require('../models/productModel')
const orderModel = require('../models/orderModel')
const  {isValidpaymentMethod,isValidselectedAddressId} = require('../validators/orderVaidation')
const RazorPay = require('../paymentGateway/RazorPay')
const productModel = require('../models/productModel')
const userData = require('../models/userModel')
const { response } = require('express')

const order = {
    orderPage: async (req,res)=>{
        try{ 
          
            const userId = req.session.user._id
            const address = await addressModel.findOne({user:userId})
            const userCart = await cartModel.findOne({userId:userId})
            const productDetails = userCart.products.map(product => ({
              productId: product.productId,
              purchasedCount: product.quantity
          }));
          console.log('product details', productDetails);
          const productIds = productDetails.map(product => product.productId);
          const products = await product.find({ _id: { $in: productIds } });
           const productPrice = products.map(product => product.ProductPrice)
           const quantities = productDetails.map(product => product.purchasedCount);
           const shippingPrice = userCart ? userCart.shippingPrice : 0;
              

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
          
              res.render('orderPage',{address,products,totalPrice, individualTotalArray,totalPriceArray,shippingPrice,allTotal, })
        }catch(error){
            console.log(error); 
            res.status(500).send('internal server error')
        }
    } ,
    order: async (req,res)=>{
      const userId= req.session.user._id 
      const selectedAddressId = req.body.selectedAddressId;
      const paymentMethod = req.body.paymentMethod
      try{
 
        
       
    
      const userAddress = await addressModel.findOne(
          { user: userId, 'address._id': selectedAddressId},
          { 'address.$': 1 }
      ); 

 
               const userCart =await cartModel.findOne({userId})
               const productDetails = userCart.products.map(product => ({
                productId: product.productId,
                purchasedCount: product.quantity
            }));
        
          const products = await product.find({ _id: { $in: productDetails.map(product => product.productId) } })
          const productPrice = products.map(product => product.ProductPrice)
          const purchasedCount = productDetails.map(product => product.purchasedCount);
          const shippingPrice = userCart ? userCart.shippingPrice : 0;
         const currentDate = new Date();
          const totalPriceArray = [];
          const individualTotalArray = [];
  
          let subTotalPrice = 0 
          for(let i =0;i<products.length;i++){
            const individualTotal = productPrice[i] *  purchasedCount[i];
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
  
      

  
        const newOrder = new orderModel({
          userId: userId,
          productDetails: productDetails,
          address: daddress,
          shippingPrice: shippingPrice,
          Total: totalPrice,
          paymentMethod: paymentMethod,
          orderDate: currentDate,
        });
        
        await newOrder.save(); // Save the order to the database
       
        const orderId = newOrder._id;
          if( paymentMethod === 'Cash on Delivery'){
            const userCart = await cartModel.findOne({userId})
              if(userCart){
              const cartProductInfo = await Promise.all(
                userCart.products.map(async (info)=>{
                  const product = await productModel.findOne({_id:info.productId})
                  let ProductCount = product.ProductCount
                      ProductCount -= info.quantity 
                      await productModel.findByIdAndUpdate({_id:info.productId},{$set:{ProductCount:ProductCount}},{new:true})
                })
              ) 
              
            await cartModel.updateOne({ userId }, { $unset: { products: 1 } });
            res.json({codSucess:true})

              }

         
         

          }
          else if(paymentMethod === 'Online Payment'){
           const response = await RazorPay.paymentGateway.generateRazorPay(orderId,Number(totalPrice))
          
           res.json({
            success: true,
            message: 'Razorpay order created successfully',
            data: response,
          });  
          }else if(paymentMethod ==='Wallet'){
              const user = await userData.findById(userId)
            
              const  userWallet = user.Wallet
              console.log('user wallet', userWallet);
             console.log('total price of the product ', totalPrice);
             if(userWallet >= totalPrice){
               const updatedWallet = userWallet-totalPrice
               console.log('updated wallet',updatedWallet);
             

               const debitTransaction = {status:'debited',amount: totalPrice, timestamp: new Date()}
               console.log('debit transaction',debitTransaction);
               await userData.updateOne(
                { _id: userId },
                { $push: { walletStatus: debitTransaction } }
              );
               await userData.findByIdAndUpdate(userId,{Wallet:updatedWallet},{new:true}) 
               console.log('user',user);
           await cartModel.updateOne({ userId }, { $unset: { products: 1 } });
              await orderModel.findOneAndUpdate(
                { _id: orderId },
                { $set: {paymentStatus: 'Approved' } },
              
              );
              res.json({walletSucess:true})
             }else{
              res.json({walletSucess:false, message:'Insufficent balance in  the wallet'})
             }
          }
        
      
  
     
      }catch(error){
        console.log(error);
        res.status(500).send('internal server error')
      }

     
  } ,
 
}


module.exports = {order} 