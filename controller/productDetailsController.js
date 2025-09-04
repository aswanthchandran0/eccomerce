const ProductDetails = require('../models/productModel');
const model = require('../models/productModel')
const fs = require('fs')

const product = {
   getAllProduct: async (req, res) => {
  try {
    console.log("request was reaching in this")
    const PRODUCTS_PER_PAGE = 10;
    const currentPage = parseInt(req.query.page) || 1;

    // Count total products
    const totalProducts = await model.countDocuments({});
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    // Fetch products with pagination
    const products = await model.find({})
      .skip((currentPage - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE)
      .populate('category', 'name') // only get the name field
      .populate('brand', 'name');   // only get the name field


      console.log("products",products)

    // Pass structured data to frontend
    res.render("productDetails", {
      pagination: {
        totalProducts,
        totalPages,
        currentPage,
        productsPerPage: PRODUCTS_PER_PAGE,
      },
      products, // renamed from productData
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
},

 toggleProductStatus :async (req,res,next)=>{
  try{
    const productId = req.params.id
    const product = await model.findById(productId)
    if(!product){
      return res.status(404).json({sucess:false,message:"Product not found"})
    }

      // Toggle isActive
    product.isActive = !product.isActive;
    await product.save();
   req.flash("success",`product ${product.isActive} successfully `)
       return res.json({success: true,});
       
  }catch(err){
    err.function = 'blockProduct'
    next(err)
  }

 }
    //  deleteProduct : async (req,res)=>{
    //     const productId = req.params.id
    //     try{ 
    //      const product =  await model.findById(productId)
    //        await  model.findByIdAndRemove(productId)
    //        if(product && product.images && product.images.length>0){
    //         product.images.forEach((image)=>{
    //            const imagePath = `${image}`
    //            console.log('imge path',imagePath);
    //                  if(fs.existsSync(imagePath)){
    //                     fs.unlinkSync(imagePath)

    //                     console.log(`Deleted image: ${image}`);
    //                  }else{
    //                     console.log(`Image not found: ${image}`);
    //                  }
    //         })
    //        }
    //        res.redirect('/admin/ProductDetails')
    //     } catch(error) {
    //         console.log(errors); 
    //         res.status(500).send('internal server error')
    //     }
    //  }
}
 
module.exports = {product}