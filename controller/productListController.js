const model = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const brandData =require('../models/BrandModel')
const productfilter = require('../validators/productFilter')

const ITEMS_PER_PAGE = 8;
let filteredProducts = []

const allProducts = {
        showProducts : async (req,res)=>{

            try{
                filteredProducts = [];

                const page = parseInt(req.query.page) || 1;
                const totalProducts = await model.countDocuments({});
                const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
                const products = await model
                .find({})
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .exec();

             const categories = await categoryData.find({})
             const brands =  await brandData.find({})
            res.render('productList', { products: products ,categories,brands,totalPages, currentPage: 'products'});

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
        
            filteredProducts = await productfilter.filterProducts(
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
       console.log('filteredProduct',filteredProducts );
            if (req.query.searchResults) {
                searchResults = JSON.parse(req.query.searchResults);
            }
            if (filteredProducts.length > 0) {
                searchResults = searchResults.filter(searchedProduct =>
                    filteredProducts.some(filteredProduct =>
                        filteredProduct._id.toString() === searchedProduct._id
                    )
                );
            }
            
            const category = await categoryData.find({})
            const brands =  await brandData.find({})
      
            res.render('productList', { products: searchResults,category,brands,totalPages:'',currentPage:'' })
        }catch(error){
            console.log(error);
            res.status(500)
        }
    },
    priceRange: async (req,res)=>{
        const minPrice = req.body.minPrice
        const maxPrice = req.body.maxPrice
        if(filteredProducts.length>0){
            const filterWithPriceRange = filteredProducts.filter(product => product.ProductPrice >=minPrice && product.ProductPrice <= maxPrice)
         return res.json({filterWithPriceRange})
        }
        const productInRange = await model.find({
            ProductPrice: {$gte:minPrice,$lte:maxPrice}
        })

        res.json({productInRange})
    }
    
}


module.exports = {allProducts}