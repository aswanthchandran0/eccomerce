var express = require('express');
var router = express.Router();
const controller = require('../controller/productViewController')

router.get('/', controller.productViewAll.productView);
module.exports = router;    