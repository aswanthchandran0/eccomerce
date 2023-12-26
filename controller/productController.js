
const ProductDetails = require('../models/productModel');
const catagoryData = require('../models/catagoryModel')
const brandData = require('../models/BrandModel')
const fs = require('fs').promises;
const sharp = require('sharp')
const { iSValidProductName, isValidProductPrice, isValidProductExpense, isValidProductProductCount, isValidProductDiscription, isValidImage, isValidCatagory } = require('../validators/adminValidation');
const { error } = require('console');

const productController = {
  addproduct: async (req, res) => {
    try {

      const { ProductName, ProductPrice, ProductExpense, Catagory, ProductCount, ProductDiscription, ProductSize, SelectedBrand } = req.body;
      const Catagories = await catagoryData.find({});
      const brands = await brandData.find({})
      const newImages = await Promise.all(req.files.map(async (file) => {
        const buffer = await sharp(file.path)
          .resize({ width: 624, height: 832 })
          .toBuffer()

        const newPath = `uploads/resized-${file.filename}`
        const filePath = `uploads/${file.filename}`;
        console.log('file path', filePath);
        await fs.writeFile(newPath, buffer)
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          await fs.unlink(filePath);
          console.log('File deleted successfully');
        } catch (error) {
          console.error('Error deleting file:', error);
        }

        return newPath;
      }))


      const errors = {
        ProductName: iSValidProductName(ProductName),
        ProductPrice: isValidProductPrice(ProductPrice),
        ProductExpense: isValidProductExpense(ProductExpense),
        ProductCount: isValidProductProductCount(ProductCount),
        ProductDiscription: isValidProductDiscription(ProductDiscription),
        category: isValidCatagory(Catagory),
        Image: isValidImage(newImages)
      }

      const hasError = Object.values(errors).some((error) => error !== null)
      if (hasError) {
        console.log('errors ', errors);
        return res.render('productAdd', { errors, Catagories, brands })
      }

      const product = new ProductDetails({
        ProductName: ProductName,
        ProductPrice: ProductPrice,
        ProductExpense: ProductExpense,
        Catagory: Catagory,
        ProductCount: ProductCount,
        ProductDiscription: ProductDiscription,
        images: newImages,
        ProductSize: ProductSize,
        Brand: SelectedBrand
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
    console.log('fileName', fileName);
    try {
      await fs.unlink(`${fileName}`);

      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  deleteUpdatingImage: async (req, res) => {
    const { productId, fileName } = req.query;
    console.log('request reaching in the deleteUpdateimage');
  try {
    // Delete the image file from the server
    await fs.unlink(`${fileName}`);
 
    // Update the ProductModel by removing the image name from the images array
    const product = await ProductDetails.findById(productId);
    const updatedImages = product.images.filter(image => image !== fileName);
    product.images = updatedImages;
    await product.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  },


  editProductPage: async (req, res) => {
    try {
      console.log('request reached');
      const productId = req.query.id
      const errors = req.query.errors ? JSON.parse(decodeURIComponent(req.query.errors)) : null;
      console.log('errors............', errors);
      const product = await ProductDetails.findById(productId)
      const Catagories = await catagoryData.find({});
      const brands = await brandData.find({})
      console.log('product', product);
      res.render('productEdit', { product, Catagories, brands, productId,errors })
    } catch (error) {
      console.log(error);
      res.status(500)
    }
  },
  // ...

updateProduct: async (req, res) => {
  try {
    const { productId, ProductName, ProductPrice, ProductExpense, Catagory, ProductCount, ProductDiscription, ProductSize, SelectedBrand } = req.body;

    const errors = {
      ProductName: iSValidProductName(ProductName),
      ProductPrice: isValidProductPrice(ProductPrice),
      ProductExpense: isValidProductExpense(ProductExpense),
      ProductCount: isValidProductProductCount(ProductCount),
      ProductDiscription: isValidProductDiscription(ProductDiscription),
      category: isValidCatagory(Catagory),
    }

    const hasError = Object.values(errors).some((error) => error !== null);
    if (hasError) {
      console.log('errors ', errors);
      return res.redirect(`/admin/editProduct/?id=${productId}&errors=${encodeURIComponent(JSON.stringify(errors))}`);
    }

    const product = await ProductDetails.findById(productId);

    product.ProductName = ProductName;
    product.ProductPrice = ProductPrice;
    product.ProductExpense = ProductExpense;
    product.Catagory = Catagory;
    product.ProductCount = ProductCount;
    product.ProductDiscription = ProductDiscription;
    product.ProductSize = ProductSize;
    product.SelectedBrand = SelectedBrand;

    if (req.files && req.files.length > 0) {
      console.log('request file',req.files);
      // Replace existing images with new ones
      const newImages = await Promise.all(req.files.map(async (file) => {
        const buffer = await sharp(file.path)
          .resize({ width: 624, height: 832 })
          .toBuffer();

          const newPath = `uploads/resized-${file.filename}`;
          const filePath = `uploads/${file.filename}`;
          

        await fs.writeFile(newPath, buffer);
        await sharp(filePath).metadata();
       

        return newPath;
      }));

      product.images = newImages;
    }

    await product.save();
    res.redirect('/admin/productDetails');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ...


}


module.exports = productController;