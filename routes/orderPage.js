var express = require('express');
var router = express.Router();
var controller = require('../controller/orderPageController')
const userValidationMiddleware = require('../middlewares/userMiddlewares')
router.get('/',userValidationMiddleware.userMiddleware.verifiy, controller.order.orderPage)
 
router.post('/order', controller.order.order)
router.post('/verifiy-payment', controller.order.verfiyPayment)
module.exports = router;    