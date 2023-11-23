var express = require('express');
var router = express.Router();
var controller = require('../controller/orderPageController')
const paymentGateway = require('../paymentGateway/RazorPay')
const userValidationMiddleware = require('../middlewares/userMiddlewares')
router.get('/',userValidationMiddleware.userMiddleware.verifiy, controller.order.orderPage)
 
router.post('/order', controller.order.order)
router.post('/verifyPayment', paymentGateway.paymentGateway.verifyPayment)
module.exports = router;     