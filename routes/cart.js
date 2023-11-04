var express = require('express');
var router = express.Router(); 
const controller = require('../controller/cartController')
const Middleware = require('../middlewares/userMiddlewares')

router.get( '/',Middleware.userMiddleware.verifiy , controller.cart.cartPage)
router.post('/',)

module.exports = router; 