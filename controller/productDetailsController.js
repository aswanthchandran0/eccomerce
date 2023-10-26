const ProductDetails = require('../models/productModel');
const model = require('../models/productModel')

const product = {
     getAllProduct: async (req,res)=>{ 
        const productData=  await model.find()
        console.log(productData);   
        res.render('productDetails',{productData}) 
     },
     deleteProduct : async (req,res)=>{
        const catagoryId = req.params.id
        try{
           await  model.findByIdAndRemove(catagoryId)
           res.redirect('/ProductDetails')
        } catch(error) {
            console.log(errors); 
            res.status(500).send('internal server error')
        }
     }
}
 
module.exports = {product}