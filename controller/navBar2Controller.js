const productData = require('../models/productModel')

const navBar = {
    search: async (req,res)=>{
        try{
            const searchQuery = req.body.q 
            console.log('reqest reached');
            const searchResults = await productData.find({ ProductName: { $regex: searchQuery, $options: 'i' } })
            res.json({ searchResults });
        }catch(error){
             
        }
      
    }
}


module.exports = {navBar}