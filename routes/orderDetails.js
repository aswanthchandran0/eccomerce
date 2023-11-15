var express = require('express');
var router = express.Router();
const controller = require('../controller/orderDetailsController')
const Middleware = require('../middlewares/userMiddlewares')

router.get('/' ,Middleware.userMiddleware.verifiy,controller.orderDetails.orderPage)
router.get('/detetOrder',controller.orderDetails.deleteOrder)

module.exports = router;
