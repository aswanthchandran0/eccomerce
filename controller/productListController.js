const model = require('../models/productModel')


const allProducts = {
        showProducts : async (req,res)=>{

            try{
            const products =  await model.find({})
            console.log(products);
            res.render('productList', { products: products });

        }catch (error){
            console.error(error);
                res.status(500).send('Internal Server Error');
        }
    }
    
}


module.exports = {allProducts}