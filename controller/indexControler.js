const productModel = require('../models/productModel')
const cartData = require('../models/cartModel')
const userData = require('../models/userModel')
const Banners = require('../models/bannerModel')
const homePage = {
        showProducts : async (req,res)=>{
            try{
            let userId
            let numberOfProduct
            let userLoged = 0
            const products =  await productModel.find({}) 
            const banners = await Banners.find({})
            if (req.session.user && req.session.user._id) {
                userId = req.session.user._id;
                 const user = await userData.findById(userId)
                 if(user && user.Authentication ==='verified'){
                           userLoged = 1
                 }
               
            }
            if(userId){
                const userCart = await cartData.findOne({userId:userId})
                numberOfProduct  =  userCart ? userCart.products.length : 0;
            }
        
            res.render('index', { products: products,numberOfProduct:numberOfProduct,banners,currentPage:'home',userLoged });


        }catch (error){
            console.error(error);
                res.status(500).send('Internal Server Error');
        }
    },
    
    
}


module.exports = {homePage}