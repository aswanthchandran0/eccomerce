const express = require('express');
const router = express.Router();
const indexController = require('../controller/indexControler')
const productListController = require('../controller/productListController')
const productViewController = require('../controller/productViewController')
const cartController = require('../controller/cartController')
const orderPageController = require('../controller/orderPageController')
const paymentGateway = require('../paymentGateway/RazorPay')
const userProfileController = require('../controller/userProfileController')
const orderDetailsController = require('../controller/orderDetailsController')
const userController = require('../controller/userController')
const otpController = require('../controller/otpController');
const rateLimit = require('express-rate-limit');
const navBar2Controller = require('../controller/navBar2Controller')
const wishlistController = require('../controller/wishlistController')
const middleware = require('../middlewares/middleware')
router.get('/productView', productViewController.productViewAll.productView);

//homePage 
router.get('/', indexController.homePage.showProducts);


//cart
router.get( '/cart',middleware.middlewares.userSession, cartController.cart.cartPage)
router.post('/addToCart',middleware.middlewares.userSession,cartController.cart.addToCart)
router.get('/deleteCart', cartController.cart.deleteCart);
router.get('/cart/updatePrice/:quantityChange/:productId/:productPrice',cartController.cart.updatePrice)
router.get('/cart/orderData/:totalPrice/:subtotalPrice/:shippingPrice/:quantity', cartController.cart.orderData);
router.post('/cart/shippingPrice',cartController.cart.shippingPrice)
router.get("/cart/processToCheckout",cartController.cart.processToCheckout)

//order
router.get('/order', orderPageController.order.orderPage)
router.post('/order/order', orderPageController.order.order)
router.post('/order/verifyPayment', paymentGateway.paymentGateway.verifyPayment)
router.post('/coupon',orderPageController.order.verifyingCoupon)

//userProfile
router.get('/userProfile',middleware.middlewares.userSession, userProfileController.userProfile.profile,)
router.post('/userProfile/address',userProfileController.userProfile.userAddress)
router.get('/userProfile/signout', userProfileController.userProfile.signout)
router.get('/userProfile/orderCancel', userProfileController.userProfile.cancelOrder)
router.get('/addressHandler',userProfileController.userProfile.addressHandler)
router.post ('/updateAddress',userProfileController.userProfile.updateAddress)
//orderDetails
router.get('/orderDetails' , orderDetailsController.orderDetails.orderPage)
router.delete('/orderDetails/detetOrder/:orderId/',orderDetailsController.orderDetails.deleteOrder)
router.get('/orderedProduct',orderDetailsController.orderDetails.orderedProductView)
router.get('/invoice',middleware.middlewares.userSession,orderDetailsController.orderDetails.inVoice)
//orderSucess
router.get('/orderSucess', function(req, res, next) {
    res.render('orderSucess', { title: 'Express' }); 
  });

//login
router.get('/login',middleware.middlewares.AuthenticationMiddleware, function(req, res, next) {
    res.render('login', { title: 'Express',errors:{} });
  });    
router.post('/login',userController.loginController)

//sign up
router.get('/signup',middleware.middlewares.AuthenticationMiddleware, function(req, res, next) {
  res.render('signup', { title: 'Express',errors:{} });
}); 
router.post('/signin', userController.signUp);

// forgot password

router.get('/emailverification',middleware.middlewares.AuthenticationMiddleware, userController.emailVerfication)
router.post('/emailverifying',userController.emailverifying)
router.get('/forgotpassword',middleware.middlewares.AuthenticationMiddleware, userController.forgotPassword)
router.post('/changePassword',userController.changePassword)
router.post('/f-otp',userController.resendOtp)
//otp 
const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  });
  
  router.get('/otp', function (req, res) {
    res.render('otp', { title: 'otp', otpError: null });
  });
  
  router.post('/otpValidation', limiter, otpController.validateOtp);
  router.post('/resend-otp', otpController.resendOtp)  

  // product list controller
  router.get('/productList', productListController.allProducts.showProducts);
  router.post('/selectedBrands',productListController.allProducts.selectedBrands)
  router.post('/priceRange',productListController.allProducts.priceRange)

  //search navBar2 controller
router.post('/productSearch', navBar2Controller.navBar.search)
router.get('/searchedProduct',productListController.allProducts.showSearchedProducts)

//wishlist 
router.get('/wishlist',middleware.middlewares.userSession,wishlistController.wishList.wishlistPage)
router.post('/addToWishlist',middleware.middlewares.userSession, wishlistController.wishList.addToWishlist)
router.get('/deleteWishist/:productId',wishlistController.wishList.delete)

module.exports = router;
