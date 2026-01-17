const model = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const brandData = require('../models/BrandModel')
const mongoose = require('mongoose') // IMPORTANT: Move this to top

const ITEMS_PER_PAGE = 8;

const allProducts = {
    showProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const totalProducts = await model.countDocuments({});
            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
            
            const products = await model
                .find({})
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate('category')
                .populate('brand')
                .exec();

            const categories = await categoryData.find({});
            const brands = await brandData.find({});
            
            console.log("Brands fetched:", brands);
            console.log("Categories fetched:", categories);
            console.log("Products fetched:", products.length);
            
            res.render('productList', { 
                products: products,
                categories,
                brands,
                totalPages, 
                currentPage: page,
                ITEMS_PER_PAGE: ITEMS_PER_PAGE,
                totalProducts: totalProducts
            });

        } catch (error) {
            console.error("Error in showProducts:", error);
            res.status(500).send('Internal Server Error');
        }
    },

    filterProducts: async (req, res) => {
        try {
            console.log("=== FILTER REQUEST ===");
            console.log("Filter request received:", req.body);
            
            const { categories, brands, sizes, minPrice, maxPrice, sortBy } = req.body;
            
            // Build filter query
            let filterQuery = { isActive: true };
            
            // Category filter - Convert string IDs to ObjectId
            if (categories && categories.length > 0) {
                const categoryObjectIds = categories.map(id => new mongoose.Types.ObjectId(id));
                filterQuery.category = { $in: categoryObjectIds };
                console.log("Category IDs (ObjectId):", categoryObjectIds.map(id => id.toString()));
            }
            
            // Brand filter - Convert string IDs to ObjectId
            if (brands && brands.length > 0) {
                const brandObjectIds = brands.map(id => new mongoose.Types.ObjectId(id));
                filterQuery.brand = { $in: brandObjectIds };
                console.log("Brand IDs (ObjectId):", brandObjectIds.map(id => id.toString()));
            }
            
            // Size filter - FIXED: Use correct MongoDB query syntax
            if (sizes && sizes.length > 0) {
                filterQuery['variants.size'] = { $in: sizes };
                console.log("Size filter:", sizes);
            }
            
            // Price range filter - Handle Decimal128 type
            if (minPrice !== undefined && maxPrice !== undefined) {
                const min = parseFloat(minPrice);
                const max = parseFloat(maxPrice);
                
                // For Decimal128, we need to compare properly
                filterQuery.price = { 
                    $gte: mongoose.Types.Decimal128.fromString(min.toString()), 
                    $lte: mongoose.Types.Decimal128.fromString(max.toString()) 
                };
                console.log("Price filter:", min, "-", max);
            }
            
            console.log("Final filter query to execute:", JSON.stringify(filterQuery, null, 2));
            
            // Build sort query
            let sortQuery = { createdAt: -1 };
            switch(sortBy) {
                case 'price_asc':
                    sortQuery = { price: 1 };
                    break;
                case 'price_desc':
                    sortQuery = { price: -1 };
                    break;
                default:
                    sortQuery = { createdAt: -1 };
            }
            console.log("Sort query:", sortQuery);
            
            // DEBUG: First, let's see what's in the database
            console.log("=== DATABASE DEBUG INFO ===");
            
            // Get total active products
            const totalActiveProducts = await model.countDocuments({ isActive: true });
            console.log(`Total active products: ${totalActiveProducts}`);
            
            // Get sample products to see their structure
            const sampleProducts = await model.find({ isActive: true }).limit(3).lean();
            console.log("Sample products structure:");
            sampleProducts.forEach((product, index) => {
                console.log(`Product ${index + 1}:`, {
                    name: product.name,
                    category: product.category,
                    brand: product.brand,
                    price: product.price ? product.price.toString() : 'N/A',
                    sizes: product.variants?.map(v => v.size) || [],
                    isActive: product.isActive
                });
            });
            
            // Check individual filters
            if (categories && categories.length > 0) {
                const categoryObjectIds = categories.map(id => new mongoose.Types.ObjectId(id));
                const productsByCategories = await model.countDocuments({ 
                    category: { $in: categoryObjectIds },
                    isActive: true 
                });
                console.log(`Products matching ANY selected category: ${productsByCategories}`);
            }
            
            if (brands && brands.length > 0) {
                const brandObjectIds = brands.map(id => new mongoose.Types.ObjectId(id));
                const productsByBrands = await model.countDocuments({ 
                    brand: { $in: brandObjectIds },
                    isActive: true 
                });
                console.log(`Products matching ANY selected brand: ${productsByBrands}`);
            }
            
            if (sizes && sizes.length > 0) {
                const productsBySizes = await model.countDocuments({ 
                    'variants.size': { $in: sizes },
                    isActive: true 
                });
                console.log(`Products with ANY selected size: ${productsBySizes}`);
            }
            
            // Execute the actual query
            console.log("=== EXECUTING QUERY ===");
            const filteredProducts = await model
                .find(filterQuery)
                .sort(sortQuery)
                .populate('category', 'name')
                .populate('brand', 'name')
                .lean();
            
            console.log("Filtered products found:", filteredProducts.length);
            
            // Log the found products for debugging
            if (filteredProducts.length > 0) {
                console.log("Found products details:");
                filteredProducts.forEach((product, index) => {
                    console.log(`${index + 1}. ${product.name} - Category: ${product.category?.name}, Brand: ${product.brand?.name}, Price: ${product.price?.toString()}`);
                });
            } else {
                console.log("No products found matching ALL filters");
                
                // Try to find why - check each filter individually
                if (categories && categories.length > 0) {
                    const categoryObjectIds = categories.map(id => new mongoose.Types.ObjectId(id));
                    const catProducts = await model.find({ 
                        category: { $in: categoryObjectIds },
                        isActive: true 
                    }).limit(3).lean();
                    console.log("Sample products with selected categories:", catProducts.map(p => p.name));
                }
            }
            
            // Format the price for frontend
            const formattedProducts = filteredProducts.map(product => {
                return {
                    ...product,
                    // Convert Decimal128 to string for easier handling
                    price: product.price ? parseFloat(product.price.toString()) : 0,
                    // Ensure variants exist
                    variants: product.variants || []
                };
            });
            
            console.log("=== SENDING RESPONSE ===");
            res.json({ 
                success: true,
                filteredProducts: formattedProducts,
                count: formattedProducts.length
            });
            
        } catch (error) {
            console.error("Error in filterProducts:", error);
            res.status(500).json({ 
                success: false,
                error: 'Internal Server Error',
                message: error.message,
                stack: error.stack // Include stack trace for debugging
            });
        }
    }
}

module.exports = { allProducts };