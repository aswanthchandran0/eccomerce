const express = require('express');
const router = express.Router();
const {checkUserStatus} = require('../controller/middleware')
const indexController = require('../controller/indexControler')
const productListController = require('../controller/productListController')
const productViewController = require('../controller/productViewController')
const cartController = require('../controller/cartController')
const userValidationMiddleware = require('../middlewares/userMiddlewares') 
const orderPageController = require('../controller/orderPageController')
const paymentGateway = require('../paymentGateway/RazorPay')
const userProfileController = require('../controller/userProfileController')
const orderDetailsController = require('../controller/orderDetailsController')
const userController = require('../controller/userController')
const otpController = require('../controller/otpController');
const rateLimit = require('express-rate-limit');
const navBar2Controller = require('../controller/navBar2Controller')

router.get('/productView', productViewController.productViewAll.productView);

//homePage
router.get('/', checkUserStatus, indexController.homePage.showProducts);


//cart
router.get( '/cart',userValidationMiddleware.userMiddleware.verifiy , cartController.cart.cartPage)
router.get('/cart/addToCart/:id',cartController.cart.addToCart)
router.get('/cart/deleteCart/:id', cartController.cart.deleteCart);
router.get('/cart/updatePrice/:quantityChange/:productId/:productPrice',cartController.cart.updatePrice)
router.get('/cart/orderData/:totalPrice/:subtotalPrice/:shippingPrice/:quantity', cartController.cart.orderData);
router.post('/cart/shippingPrice',cartController.cart.shippingPrice)
router.get("/cart/processToCheckout",cartController.cart.processToCheckout)

//order
router.get('/order',userValidationMiddleware.userMiddleware.verifiy, orderPageController.order.orderPage)
router.post('/order/order', orderPageController.order.order)
router.post('/order/verifyPayment', paymentGateway.paymentGateway.verifyPayment)
router.post('/coupon',orderPageController.order.verifyingCoupon)

//userProfile
router.get('/userProfile', userProfileController.userProfile.profile,)
router.post('/userProfile/address',userProfileController.userProfile.userAddress)
router.get('/userProfile/signout', userProfileController.userProfile.signout)
router.get('/userProfile/orderCancel', userProfileController.userProfile.cancelOrder)

//orderDetails
router.get('/orderDetails' ,userValidationMiddleware.userMiddleware.verifiy, orderDetailsController.orderDetails.orderPage)
router.delete('/orderDetails/detetOrder/:orderId/',orderDetailsController.orderDetails.deleteOrder)

//orderSucess
router.get('/orderSucess', function(req, res, next) {
    res.render('orderSucess', { title: 'Express' });
  });

//login
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express',errors:{} });
  });    
router.post('/login/login',userController.loginController)
router.post('/login/signin', userController.signUp);

//otp
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  });
  
  router.get('/otp', function (req, res) {
    res.render('otp', { title: 'otp', otpError: null });
  });
  
  router.post('/otp/otpValidation', limiter, otpController.validateOtp);
  router.post('/otp/resend-otp', otpController.resendOtp)  

  // product list controller
  router.get('/productList', checkUserStatus, productListController.allProducts.showProducts);
  router.post('/selectedBrands',productListController.allProducts.selectedBrands)

  //search navBar2 controller
router.post('/productSearch', navBar2Controller.navBar.search)
router.get('/searchedProduct',productListController.allProducts.showSearchedProducts)
module.exports = router;
