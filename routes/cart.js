var express = require('express');
var router = express.Router(); 
const controller = require('../controller/cartController')
const Middleware = require('../middlewares/userMiddlewares')

router.get( '/',Middleware.userMiddleware.verifiy , controller.cart.cartPage)
router.post('/',)

router.get('/addToCart/:id',controller.cart.addToCart)
//router.post('/updateTotalPrice',controller.cart.updateTotalPrice)
router.get('/deleteCart/:id', controller.cart.deleteCart);
router.get('/updatePrice/:quantityChange/:productId/:productPrice',controller.cart.updatePrice)
module.exports = router; 