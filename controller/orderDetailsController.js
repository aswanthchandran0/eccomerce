const orderData = require('../models/orderModel')

const orderDetails = {
    orderPage: async(req,res)=>{
        try{
            const userId = req.session.user._id
            const orderedProducts = await orderData.find({userId:userId})

            res.render('orderDetails',{ orderedProducts: orderedProducts })
        }catch(error){
             console.log(error);
             res.status(500).send('internal server error')
        }
       
    },
    deleteOrder: async(req,res)=>{
        try{
            const userId = req.session.user._id
        await orderData.findOneAndUpdate(
                { userId: userId},
                { $set: { orderStatus: 'canceled' } },
                { new: true }
            );
    


        res.redirect('/orderDetails')
        }catch(error){
            console.log(error)
            res.status(500).send('internal server error')
        }
        

    }
}





module.exports = {orderDetails}


    








//               const userId = req.session.user._id;
           
//               const orderDetails = await orderData.find({userId:userId})
//               const productIds = orderDetails.map(order => order.productId).flat();
//               const productDetails = await productModel.find({ _id: { $in: productIds } });
//               console.log('product details'+productDetails);
// console.log('order details'+orderDetails);
//               const userAddress = await AddressModel.findOne({ user: userId });
//              // res.render('userProfile',{ user: req.session.user, ValidationErr:req.session.validationErr,userdata: userAddress,orderDetails,productDetails})
    
 
//   res.render('orderDetails',orderDetails,productDetails,userAddress);