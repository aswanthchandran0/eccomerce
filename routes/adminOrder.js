var express = require('express');
var router = express.Router();
const controller = require('../controller/adminOrderController')


router.get('/', controller.orderStatus.orderStatusPage);
module.exports = router; 