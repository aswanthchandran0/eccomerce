 
const express = require('express')
var router = express.Router()
const controller = require('../controller/userProfileController')
const middleware = require('../middlewares/userMiddlewares')


router.get('/', controller.userProfile.profile,)

router.post('/address',controller.userProfile.userAddress)
router.get('/signout', controller.userProfile.signout)
router.get('/orderCancel', controller.userProfile.cancelOrder)
module.exports = router; 