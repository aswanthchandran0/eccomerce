const model = require('../models/productModel')
const categoryData = require('../models/catagoryModel')
const brandData =require('../models/BrandModel')
const productfilter = require('../validators/productFilter')
const allProducts = {
        showProducts : async (req,res)=>{

            try{
        
             const category = await categoryData.find({})
             const brands =  await brandData.find({})
            const products =  await model.find({})
            res.render('productList', { products: products ,category,brands});

        }catch (error){
            console.error(error);
                res.status(500).send('Internal Server Error');
        }
    },
    selectedBrands: async(req,res)=>{
       try{
        let selectedBrands = JSON.parse(req.body.brand);
        let selectedCategory = JSON.parse(req.body.category)
        let selectedSize = JSON.parse(req.body.size)
        selectedBrands = selectedBrands.filter(brand => brand !== null);
        selectedCategory = selectedCategory.filter(category => category !== null);
        selectedSize = selectedSize.filter(size => size !== 'on');
        
           const filteredProducts = await productfilter.filterProducts(
            selectedBrands,selectedCategory,selectedSize
           )
           res.json({ filteredProducts });
       }catch(error){
        console.log(error);
        res.status(500)
       }
    },
    showSearchedProducts : async (req,res)=>{
        try{
            let searchResults = []

            if (req.query.searchResults) {
                searchResults = JSON.parse(req.query.searchResults);
            }
            console.log('searchresult',searchResults);
            
            const category = await categoryData.find({})
            const brands =  await brandData.find({})
            res.render('productList', { products: searchResults,category,brands })
        }catch(error){
            console.log(error);
            res.status(500)
        }
    }
    
}


module.exports = {allProducts}