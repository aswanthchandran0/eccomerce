const productModel = require('../models/productModel')
const cartData = require('../models/cartModel')
const Banners = require('../models/bannerModel')
const homePage = {
        showProducts : async (req,res)=>{
            try{
            let userId
            let numberOfProduct
            const products =  await productModel.find({}) 
            const banners = await Banners.find({})
            if (req.session.user && req.session.user._id) {
                userId = req.session.user._id;
            }
            if(userId){
                const userCart = await cartData.findOne({userId:userId})
                numberOfProduct  =  userCart ? userCart.products.length : 0;
            }
        
            res.render('index', { products: products,numberOfProduct:numberOfProduct,banners,currentPage:'home' });


        }catch (error){
            console.error(error);
                res.status(500).send('Internal Server Error');
        }
    },
    
    
}


module.exports = {homePage}