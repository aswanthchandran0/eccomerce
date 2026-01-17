const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const User = require('../models/userModel');
const AddressModel = require('../models/userAddressModel');

const cartController = {
    // Simplified addToCart - no size handling
    addToCart: async (req, res) => {
        try {
            console.log('Add to cart called');
            console.log('Session user:', req.session.user);
            
            if (!req.session.user) {
                return res.json({ 
                    success: false, 
                    notLoggedIn: true,
                    message: "Please login to add items to cart"
                });
            }

            const userId = req.session.user._id;
            const { productId, quantity = 1 } = req.body;

            console.log('Add to cart data:', { userId, productId, quantity });

            // Validate input
            if (!productId) {
                console.log('Missing productId');
                return res.json({ 
                    success: false, 
                    error: 'Product ID is required' 
                });
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                console.log('Product not found:', productId);
                return res.json({ 
                    success: false, 
                    error: 'Product not found' 
                });
            }

            console.log('Product found:', product.name);

            // Check if product has any stock (check all variants)
            const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
            if (totalStock === 0) {
                console.log('Product out of stock');
                return res.json({ 
                    success: false, 
                    error: 'Product is out of stock' 
                });
            }

            console.log('Product stock available:', totalStock);

            // Find user's cart or create one
            let cart = await Cart.findOne({ userId });

            if (!cart) {
                console.log('Creating new cart for user');
                // Create new cart
                cart = new Cart({
                    userId,
                    products: [{
                        productId,
                        quantity: parseInt(quantity)
                    }],
                    shippingPrice: 0
                });
                await cart.save();
                console.log('New cart created:', cart);
            } else {
                console.log('Existing cart found:', cart._id);
                
                // Check if product already in cart
                const existingProductIndex = cart.products.findIndex(
                    item => item.productId.toString() === productId
                );

                if (existingProductIndex > -1) {
                    console.log('Product already in cart, updating quantity');
                    // Update quantity if product exists
                    cart.products[existingProductIndex].quantity += parseInt(quantity);
                    await cart.save();
                    return res.json({ 
                        success: true, 
                        message: "Product quantity updated in cart",
                        productExist: true,
                        cartCount: cart.products.reduce((sum, item) => sum + item.quantity, 0)
                    });
                } else {
                    console.log('Adding new product to cart');
                    // Add new product to cart
                    cart.products.push({
                        productId,
                        quantity: parseInt(quantity)
                    });
                    await cart.save();
                }
            }

            const totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
            console.log('Cart updated successfully. Total items:', totalItems);

            return res.json({ 
                success: true, 
                message: "Product added to cart successfully",
                cartCount: totalItems
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            return res.json({ 
                success: false, 
                error: 'Failed to add product to cart' 
            });
        }
    },

    // Get cart count
    getCartCount: async (req, res) => {
        try {
            console.log('Getting cart count');
            
            if (!req.session.user) {
                console.log('User not logged in, returning count 0');
                return res.json({ success: true, count: 0 });
            }

            const userId = req.session.user._id;
            const cart = await Cart.findOne({ userId });
            
            if (!cart) {
                console.log('No cart found for user');
                return res.json({ success: true, count: 0 });
            }

            // Calculate total items (sum of quantities)
            const totalItems = cart.products.reduce((total, item) => total + item.quantity, 0);
            console.log('Cart count:', totalItems);
            
            return res.json({ 
                success: true, 
                count: totalItems
            });

        } catch (error) {
            console.error('Error getting cart count:', error);
            return res.json({ success: false, count: 0 });
        }
    },

   cartPage: async (req, res) => {
    try {
        console.log('Loading cart page');
        
        if (!req.session.user) {
            console.log('User not logged in, redirecting to login');
            return res.redirect('/login');
        }

        const userId = req.session.user._id;
        
        // Get user's cart
        const userCart = await Cart.findOne({ userId });
        
        if (!userCart || userCart.products.length === 0) {
            console.log('No cart found, rendering empty cart');
            return res.render('cart', { 
                userCart: null,
                products: [],
                totalPrice: 0,
                shipping: 0,
                finalTotal: 0,
                isEmpty: true,
                currentPage: 'cart' // ADD THIS
            });
        }

        console.log('Cart found with', userCart.products.length, 'items');

        // Get all product details
        let products = [];
        let totalPrice = 0;
        
        // Loop through cart items and fetch product details
        for (const item of userCart.products) {
            const product = await Product.findById(item.productId)
                .populate('category')
                .populate('brand');
            
            if (product) {
                // Add quantity to product object
                const productWithQuantity = {
                    ...product.toObject(),
                    quantity: item.quantity,
                    // Calculate item total
                    itemTotal: parseFloat(product.price) * item.quantity
                };
                
                products.push(productWithQuantity);
                totalPrice += productWithQuantity.itemTotal;
            }
        }

        // Calculate shipping
        const shipping = totalPrice > 1000 ? 0 : 50;
        const finalTotal = totalPrice + shipping;

        console.log('Cart totals - Subtotal:', totalPrice, 'Shipping:', shipping, 'Total:', finalTotal);

        return res.render('cart', {
            userCart: userCart,
            products: products,
            totalPrice: totalPrice.toFixed(2),
            shipping: shipping.toFixed(2),
            finalTotal: finalTotal.toFixed(2),
            isEmpty: products.length === 0,
            currentPage: 'cart' // ADD THIS
        });

    } catch (error) {
        console.error('Error viewing cart:', error);
        return res.status(500).send('Internal server error');
    }
},

    // Update cart item quantity
    updateCartQuantity: async (req, res) => {
        try {
            console.log('Updating cart quantity');
            
            if (!req.session.user) {
                return res.json({ notLoggedIn: true });
            }

            const userId = req.session.user._id;
            const { itemId, quantity } = req.body;

            console.log('Update data:', { userId, itemId, quantity });

            const cart = await Cart.findOne({ userId });
            if (!cart) {
                console.log('Cart not found');
                return res.json({ success: false, error: 'Cart not found' });
            }

            // Find the item in cart
            const itemIndex = cart.products.findIndex(
                item => item._id.toString() === itemId
            );

            if (itemIndex === -1) {
                console.log('Item not found in cart');
                return res.json({ success: false, error: 'Item not found in cart' });
            }

            // Get product to check stock
            const product = await Product.findById(cart.products[itemIndex].productId);
            
            // Check total stock across all variants
            const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
            
            if (totalStock < quantity) {
                console.log('Insufficient stock. Available:', totalStock, 'Requested:', quantity);
                return res.json({ 
                    success: false, 
                    insufficientStock: true,
                    message: `Only ${totalStock} units available` 
                });
            }

            // Update quantity
            cart.products[itemIndex].quantity = parseInt(quantity);
            await cart.save();

            console.log('Quantity updated to:', quantity);

            // Recalculate totals
            let subtotal = 0;
            cart.products.forEach(item => {
                if (item.productId && item.productId.price) {
                    subtotal += parseFloat(item.productId.price.toString()) * item.quantity;
                }
            });

            const shipping = subtotal > 1000 ? 0 : 50;
            const total = subtotal + shipping;

            return res.json({ 
                success: true,
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                total: total.toFixed(2),
                itemTotal: (parseFloat(cart.products[itemIndex].productId.price.toString()) * quantity).toFixed(2)
            });

        } catch (error) {
            console.error('Error updating cart:', error);
            return res.json({ success: false, error: 'Internal server error' });
        }
    },

    // Remove item from cart
    removeFromCart: async (req, res) => {
        try {
            console.log('Removing item from cart');
            
            if (!req.session.user) {
                return res.json({ notLoggedIn: true });
            }

            const userId = req.session.user._id;
            const { itemId } = req.body;

            console.log('Remove data:', { userId, itemId });

            const cart = await Cart.findOne({ userId });
            if (!cart) {
                console.log('Cart not found');
                return res.json({ success: false, error: 'Cart not found' });
            }

            // Remove item
            const initialLength = cart.products.length;
            cart.products = cart.products.filter(item => item._id.toString() !== itemId);
            
            if (cart.products.length === initialLength) {
                console.log('Item not found in cart');
                return res.json({ success: false, error: 'Item not found in cart' });
            }
            
            await cart.save();

            console.log('Item removed. Remaining items:', cart.products.length);

            // Recalculate totals
            let subtotal = 0;
            cart.products.forEach(item => {
                if (item.productId && item.productId.price) {
                    subtotal += parseFloat(item.productId.price.toString()) * item.quantity;
                }
            });

            const shipping = subtotal > 1000 ? 0 : 50;
            const total = subtotal + shipping;

            return res.json({ 
                success: true,
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                total: total.toFixed(2),
                isEmpty: cart.products.length === 0,
                cartCount: cart.products.reduce((sum, item) => sum + item.quantity, 0)
            });

        } catch (error) {
            console.error('Error removing from cart:', error);
            return res.json({ success: false, error: 'Internal server error' });
        }
    },

    // Other functions remain mostly the same
     deleteCart: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.json({ 
                    success: false, 
                    notLoggedIn: true 
                });
            }

            const userId = req.session.user._id;
            const productId = req.query.id;

            console.log('Deleting product from cart:', productId);

            // Find user's cart
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return res.json({ 
                    success: false, 
                    error: 'Cart not found' 
                });
            }

            // Remove the specific product from cart
            const initialLength = cart.products.length;
            cart.products = cart.products.filter(item => 
                item.productId.toString() !== productId
            );

            if (cart.products.length === initialLength) {
                return res.json({ 
                    success: false, 
                    error: 'Product not found in cart' 
                });
            }

            await cart.save();

            // Recalculate totals if cart is not empty
            let subtotal = 0;
            let shipping = 0;
            let total = 0;
            let isEmpty = cart.products.length === 0;

            if (!isEmpty) {
                for (const item of cart.products) {
                    const product = await Product.findById(item.productId);
                    if (product && product.price) {
                        subtotal += parseFloat(product.price.toString()) * item.quantity;
                    }
                }
                shipping = subtotal > 1000 ? 0 : 50;
                total = subtotal + shipping;
            }

            return res.json({ 
                success: true,
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                total: total.toFixed(2),
                isEmpty: isEmpty,
                cartCount: cart.products.reduce((sum, item) => sum + item.quantity, 0)
            });

        } catch (error) {
            console.error('Error deleting from cart:', error);
            return res.json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    },

     // FIXED updatePrice function
    updatePrice: async (req, res) => {
        try {
            const { quantityChange, productId, productPrice } = req.params;
            
            if (!req.session.user) {
                return res.json({ 
                    success: false, 
                    notLoggedIn: true 
                });
            }

            const userId = req.session.user._id;
            
            // Find user's cart
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return res.json({ 
                    success: false, 
                    error: 'Cart not found' 
                });
            }

            // Find the product in cart
            const cartItem = cart.products.find(item => 
                item.productId.toString() === productId
            );

            if (!cartItem) {
                return res.json({ 
                    success: false, 
                    error: 'Product not found in cart' 
                });
            }

            // Get product to check stock
            const product = await Product.findById(productId);
            if (!product) {
                return res.json({ 
                    success: false, 
                    error: 'Product not found' 
                });
            }

            // Calculate new quantity
            const newQuantity = cartItem.quantity + parseInt(quantityChange);
            
            // Check if new quantity is valid
            if (newQuantity < 1) {
                return res.json({ 
                    success: false, 
                    error: 'Quantity cannot be less than 1' 
                });
            }

            // Check stock availability
            const totalStock = product.variants?.reduce((sum, variant) => 
                sum + (variant.stock || 0), 0) || 0;
            
            if (newQuantity > totalStock) {
                return res.json({ 
                    success: false, 
                    insufficientStock: true,
                    message: `Only ${totalStock} units available` 
                });
            }

            // Update quantity in cart
            cartItem.quantity = newQuantity;
            await cart.save();

            // Calculate new price
            const newPrice = parseFloat(productPrice) * newQuantity;

            // Recalculate cart totals
            let subtotal = 0;
            for (const item of cart.products) {
                const prod = await Product.findById(item.productId);
                if (prod && prod.price) {
                    subtotal += parseFloat(prod.price.toString()) * item.quantity;
                }
            }

            const shipping = subtotal > 1000 ? 0 : 50;
            const total = subtotal + shipping;

            return res.json({ 
                success: true,
                newPrice: newPrice.toFixed(2),
                quantity: newQuantity,
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                total: total.toFixed(2),
                cartCount: cart.products.reduce((sum, item) => sum + item.quantity, 0)
            });

        } catch (error) {
            console.error('Error updating price:', error);
            return res.json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    },


    orderData: async (req, res) => {
        try {
            const { totalPrice, subtotalPrice, shippingPrice, quantity } = req.params;
            
            req.session.orderData = {
                totalPrice: parseFloat(totalPrice),
                subtotalPrice: parseFloat(subtotalPrice),
                shippingPrice: parseFloat(shippingPrice),
                quantity: parseInt(quantity)
            };
            
            return res.json({ success: true });
            
        } catch (error) {
            console.error('Error saving order data:', error);
            return res.json({ success: false, error: 'Internal server error' });
        }
    },

    shippingPrice: async (req, res) => {
        try {
            const { address } = req.body;
            
            let shippingPrice = 50;
            
            if (address && address.includes('express')) {
                shippingPrice = 100;
            }
            
            return res.json({ 
                success: true, 
                shippingPrice: shippingPrice 
            });
            
        } catch (error) {
            console.error('Error calculating shipping:', error);
            return res.json({ success: false, error: 'Internal server error' });
        }
    },

   
// cartController.js - processToCheckout function (updated)
processToCheckout: async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user._id;
        
        // Fetch cart with populated products
        const cart = await Cart.findOne({ userId })
            .populate('products.productId')
            .lean();
        
        if (!cart || cart.products.length === 0) {
            return res.redirect('/cart');
        }

        // Fetch user addresses
        const address = await AddressModel.findOne({ user: userId }).lean();
        
        // Calculate prices
        let totalPrice = 0;
        let individualTotalArray = [];
        let productNames = [];
        
        if (cart.products && cart.products.length > 0) {
            cart.products.forEach(product => {
                if (product && product.productId && product.productId.price) {
                    const productTotal = product.productId.price * product.quantity;
                    individualTotalArray.push(productTotal);
                    totalPrice += productTotal;
                    productNames.push(product.productId.name);
                }
            });
        }

        const shippingPrice = totalPrice > 0 ? (totalPrice > 500 ? 0 : 50) : 0;
        
        // Get coupon details from session (ADD THESE)
        const discountAmount = req.session.discountAmount || 0;
        const discountPercentage = req.session.discountPercentage || 0;
        const couponCode = req.session.couponCode || '';
        const discountSuccess = req.session.discountSuccess || false;
        const discountError = req.session.discountError || null;
        
        const allTotal = totalPrice + shippingPrice - discountAmount;
        
        // Get user data for wallet
        const user = await User.findOne({ _id: userId });
        const walletBalance = user ? user.Wallet || 0 : 0;

        return res.render('orderPage', {
            user: req.session.user,
            currentPage: 'checkout',
            cart: cart,
            products: cart.products,
            productNames: productNames,
            totalPrice: totalPrice,
            individualTotalArray: individualTotalArray,
            shippingPrice: shippingPrice,
            allTotal: allTotal,
            
            // ADD ALL THESE COUPON VARIABLES:
            discountAmount: discountAmount,
            discountPercentage: discountPercentage,
            couponCode: couponCode,
            discountSuccess: discountSuccess,
            discountError: discountError,
            
            address: address,
            walletBalance: walletBalance
        });
        
    } catch (error) {
        console.error('Error processing checkout:', error);
        return res.status(500).send('Internal server error');
    }
}
};

module.exports = cartController;