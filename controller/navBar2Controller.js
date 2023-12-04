const productData = require('../models/productModel')
const cartData = require('../models/cartModel')
const navBar = {
    search: async (req,res)=>{
        try{
            let userId
            let numberOfProduct
            const searchQuery = req.body.q 
            if(req.session.user && req.session.user._id){
            userId = req.session.user._id
            }
            if(userId){
                const userCart = await cartData.findOne({userId:userId})
                numberOfProduct  =  userCart ? userCart.products.length : 0;
            }
            const searchResults = await productData.find({ ProductName: { $regex: searchQuery, $options: 'i' } })
            res.json({ searchResults, numberOfProduct});
        }catch(error){
             
        }
      
    }
}


module.exports = {navBar}