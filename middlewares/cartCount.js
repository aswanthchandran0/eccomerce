const cartModel = require('../models/cartModel');

const cartCountMiddleware = async (req, res, next) => {
    try {
        let numberOfProduct = 0;
        
        if (req.session.user && req.session.user._id) {
            const userId = req.session.user._id;
            const userCart = await cartModel.findOne({ userId });
            numberOfProduct = userCart ? userCart.products.length : 0;
        }
        
        // Make cart count available to ALL templates
        res.locals.numberOfProduct = numberOfProduct;
        
        next();
    } catch (error) {
        console.error('Cart count middleware error:', error);
        res.locals.numberOfProduct = 0;
        next();
    }
};

module.exports = cartCountMiddleware;