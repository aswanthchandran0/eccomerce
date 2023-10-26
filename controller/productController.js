
const ProductDetails = require('../models/productModel');


const productController = {
    addproduct: async (req, res) => {
        try {
            
            const { ProductName, ProductPrice, ProductDiscount, Catagory, ProductDiscription } = req.body;
               const images = req.files.map(file => file.path);
               const newProduct = new ProductDetails({
                images:images,
                ProductName:ProductName,
                ProductDiscription:ProductDiscription,
                ProductPrice:ProductPrice,
                ProductDiscount:ProductDiscount,
                Catagory:Catagory
               })
               await newProduct.save()
           res.redirect('/productDetails')
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}


module.exports = productController;