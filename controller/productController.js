
const ProductDetails = require('../models/productModel');
const catagoryData = require('../models/catagoryModel')
const brandData = require('../models/BrandModel')
const fs = require('fs').promises;

const {iSValidProductName,isValidProductPrice,isValidProductExpense,isValidProductProductCount,isValidProductDiscription,isValidImage, isValidCatagory} = require('../validators/adminValidation')

const productController = {
    addproduct: async (req, res) => {
        try { 
            
            const { ProductName, ProductPrice, ProductExpense, Catagory,ProductCount, ProductDiscription,ProductSize,SelectedBrand } = req.body;
            const Catagories = await catagoryData.find({});
            const brands = await brandData.find({})
            const newImages = req.files.map(file => file.path);
            

              const errors = {
                 ProductName:iSValidProductName(ProductName),
                 ProductPrice:isValidProductPrice(ProductPrice),
                 ProductExpense:isValidProductExpense(ProductExpense),
                 ProductCount:isValidProductProductCount(ProductCount),
                 ProductDiscription:isValidProductDiscription(ProductDiscription),
                 category:isValidCatagory(Catagory),
                 Image:isValidImage(newImages)
              }

              const hasError = Object.values(errors).some((error)=> error !==null)
              if(hasError){
                console.log('errors ',errors);
                return res.render('productAdd',{errors,Catagories,brands}) 
              }
       
              const  product = new ProductDetails({
                ProductName:ProductName,
                ProductPrice:ProductPrice,
                ProductExpense:ProductExpense,
                Catagory:Catagory,
                ProductCount:ProductCount,
                ProductDiscription:ProductDiscription,
                 images:newImages,
                 ProductSize:ProductSize,
                 Brand:SelectedBrand
              });

            
            await product.save();
           
           res.redirect('/admin/productDetails')
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteImage: async (req, res) => {
        const { fileName } = req.query;
                  console.log('fileName',fileName);
        try {
            await fs.unlink(`uploads/${fileName}`);

            res.status(200).json({ message: 'Image deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}


module.exports = productController;