
const ProductDetails = require('../models/productModel');
  

const productController = {
    addproduct: async (req, res) => {
        try { 
            
            const { ProductName, ProductPrice, ProductDiscount, Catagory, ProductDiscription } = req.body;
            const existingImages = req.product.images || [];
            const removedImages = req.body.removedImages || [];
            const updatedImages = existingImages.filter(image => !removedImages.includes(image));

               const newImages = req.files.map(file => file.path);
               updatedImages.push(...newImages);

               let product;

               if (req.product) {

                product = req.product;
            } else {
                product = new ProductDetails();
            } 
            product.ProductName = ProductName;
            product.ProductPrice = ProductPrice;
            product.ProductDiscount = ProductDiscount;
            product.Catagory = Catagory;
            product.ProductDiscription = ProductDiscription;
            product.images = updatedImages;
            
            await product.save();
           
           res.redirect('/productDetails')
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteImage: async (req, res) => {
        const { fileName } = req.query;

        try {
            await fs.unlink(`/uploads${fileName}`);
            res.status(200).json({ message: 'Image deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}


module.exports = productController;