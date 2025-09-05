const fs = require("fs").promises;
const sharp = require("sharp");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const brandData = require("../models/BrandModel");
const mongoose = require("mongoose");

const {
  validateProductName,
  validatePrice,
  validateDescription,
  validateCategory,
  validateBrand,
  validateVariants,
  validateImages,
} = require("../validators/productValidators");

// Add product
exports.productCreationPage = async (req, res) => {
  const ProductId = req.query.id;
  const categories = await Category.find({});
  const brands = await brandData.find({});

  let product = {}; // Initialize product as an empty object
  if (ProductId) {
    product = await Product.findById(ProductId);
  }

  res.render("productAdd", { brands, categories, product, errors: {} });
};

exports.productEditPage = async (req, res) => {
  const productId = req.params.id;
  const categories = await Category.find({});
  const brands = await brandData.find({});
  let product = {};
  if (productId) {
    product = await Product.findById(productId);
  }
  res.render("productEdit", { brands, categories, product, errors: {} });
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, brand, variants } = req.body;

    // Image processing with delay for Windows
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const newImages = await Promise.all(
      req.files.map(async (file) => {
        const newPath = `uploads/resized-${file.filename}`;
        await sharp(file.path).resize(624, 832).toFile(newPath);

        await delay(100); // allow Windows to release file
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }

        return newPath;
      })
    );

    // Validations
    const errors = {
      name: validateProductName(name),
      price: validatePrice(price),
      description: validateDescription(description),
      category: validateCategory(category),
      brand: validateBrand(brand),
      variants: validateVariants(variants),
      images: validateImages(newImages),
    };

    Object.keys(errors).forEach((key) => {
      if (errors[key] === null) delete errors[key];
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Create product (fixed ObjectId usage)
    const product = new Product({
      name,
      price,
      description,
      category: new mongoose.Types.ObjectId(category),
      brand: new mongoose.Types.ObjectId(brand),
      variants: JSON.parse(variants),
      images: newImages,
    });

    await product.save();

    req.flash("success", "✅ Product added successfully!");
    return res.json({ success: true });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, brand, variants } = req.body;

    console.log("Updating product:", id);

    // Find existing product
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Process new images if uploaded
    let newImages = [...product.images]; // keep old images
    if (req.files && req.files.length > 0) {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const newPath = `uploads/resized-${file.filename}`;
          await sharp(file.path).resize(624, 832).toFile(newPath);

          await delay(100); // let Windows release file
          try {
            await fs.unlink(file.path); // delete temp
          } catch (err) {
            console.error("Error deleting temp file:", err);
          }

          return newPath;
        })
      );

      // newImages = [...newImages, ...uploadedImages];
      newImages = [ ...uploadedImages];
    }

    // Validation (you can keep your existing validators)
    if (!name || !price || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Update product
    product.name = name;
    product.price = price;
    product.description = description;
    product.category = new mongoose.Types.ObjectId(category);
    product.brand = new mongoose.Types.ObjectId(brand);
    product.variants = variants ? typeof variants === "string"? JSON.parse(variants): variants : product.variants;
    product.images = newImages;

    await product.save();
    req.flash("success", `product "${product.name} updated successfully"`);
    res.json({ success: true, message: "Product updated successfully!" });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteUpdatingImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete file
    await fs
      .unlink(fileName)
      .catch((err) =>
        console.warn("File not found, skipping unlink:", err.message)
      );

    // Remove from DB
    product.images = product.images.filter((img) => img !== fileName);
    await product.save();

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("deleteUpdatingImage error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// const productController = {
//    createProduct: async (req, res) => {
//     try {
//       const { name, price, description, category, brand, variants } = req.body;

//       // Fetch categories and brands for rendering back if error
//       const categories = await catagoryData.find({});
//       const brands = await brandData.find({});

//       // Image processing (resize + save)
//       const newImages = await Promise.all(
//         req.files.map(async (file) => {
//           const buffer = await sharp(file.path)
//             .resize({ width: 624, height: 832 })
//             .toBuffer();

//           const newPath = `uploads/resized-${file.filename}`;
//           await fs.writeFile(newPath, buffer);

//           // Delete original file
//           try {
//             await fs.unlink(file.path);
//           } catch (error) {
//             console.error('Error deleting file:', error);
//           }

//           return newPath;
//         })
//       );

//       // Run validations
//       const errors = {
//         name: validateProductName(name),
//         price: validatePrice(price),
//         description: validateDescription(description),
//         category: validateCategory(category),
//         brand: validateBrand(brand),
//         variants: validateVariants(variants),
//         images: validateImages(newImages),
//       };

//       const hasError = Object.values(errors).some((err) => err !== null);

//       if (hasError) {
//         return res.render('productAdd', { errors, categories, brands });
//       }

//       // Create product
//       const product = new ProductDetails({
//         name,
//         price,
//         description,
//         category,
//         brand,
//         variants: JSON.parse(variants), // if variants comes as JSON string
//         images: newImages,
//       });

//       await product.save();
//       res.redirect('/admin/productDetails');
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   },
//   deleteImage: async (req, res) => {

//     const { fileName } = req.query;
//     console.log('fileName', fileName);
//     try {
//       await fs.unlink(`${fileName}`);

//       res.status(200).json({ message: 'Image deleted successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   },

//   editProductPage: async (req, res) => {
//     try {
//       console.log('request reached');
//       const productId = req.query.id
//       const errors = req.query.errors ? JSON.parse(decodeURIComponent(req.query.errors)) : null;
//       console.log('errors............', errors);
//       const product = await ProductDetails.findById(productId)
//       const Catagories = await catagoryData.find({});
//       const brands = await brandData.find({})
//       console.log('product', product);
//       res.render('productEdit', { product, Catagories, brands, productId,errors })
//     } catch (error) {
//       console.log(error);
//       res.status(500)
//     }
//   },
//   // ...

// // ...

// }

// module.exports = productController;
