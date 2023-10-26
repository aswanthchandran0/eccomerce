const model = require('../models/productModel')


const homePage = {
        showProducts : async (req,res)=>{

            try{
            const products =  await model.find({})
            console.log(products);
            res.render('index', { products: products });

        }catch (error){
            console.error(error);
                res.status(500).send('Internal Server Error');
        }
    }
    
}


module.exports = {homePage}