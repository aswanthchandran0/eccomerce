const express = require('express');
const userRouter = express();
const bodyParser = require('body-parser')
const path = require('path');
userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({ extended: true }))
userRouter.set('view engine', 'ejs')
userRouter.set('views', './views/user')
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
userRouter.get('/productView', productViewController.productViewAll.productView);

//homePage 
userRouter.get('/', indexController.homePage.showProducts);


//cart
userRouter.get( '/cart',middleware.middlewares.userSession, cartController.cart.cartPage)
userRouter.post('/addToCart',cartController.cart.addToCart)
userRouter.get('/deleteCart',middleware.middlewares.userSession, cartController.cart.deleteCart);
userRouter.get('/cart/updatePrice/:quantityChange/:productId/:productPrice',middleware.middlewares.userSession, cartController.cart.updatePrice)
userRouter.get('/cart/orderData/:totalPrice/:subtotalPrice/:shippingPrice/:quantity', cartController.cart.orderData);
userRouter.post('/cart/shippingPrice',middleware.middlewares.userSession,cartController.cart.shippingPrice)
userRouter.get("/cart/processToCheckout",middleware.middlewares.userSession, cartController.cart.processToCheckout)

//order
userRouter.get('/order',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.orderPage)
userRouter.post('/order/order',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.order)
userRouter.post('/order/verifyPayment',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, paymentGateway.paymentGateway.verifyPayment)
userRouter.post('/coupon',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.verifyingCoupon)
userRouter.get('/api/getUpdatedData',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.updateOrderPage)
//userProfile
userRouter.get('/userProfile',middleware.middlewares.userSession, userProfileController.userProfile.profile,)
userRouter.post('/userProfile/address',middleware.middlewares.userSession, userProfileController.userProfile.userAddress)
userRouter.get('/userProfile/signout',middleware.middlewares.userSession, userProfileController.userProfile.signout)
userRouter.get('/userProfile/orderCancel',middleware.middlewares.userSession, userProfileController.userProfile.cancelOrder)
userRouter.get('/addressHandler',middleware.middlewares.userSession, userProfileController.userProfile.addressHandler)
userRouter.post ('/updateAddress',middleware.middlewares.userSession, userProfileController.userProfile.updateAddress)
//orderDetails
userRouter.get('/orderDetails' ,middleware.middlewares.userSession, orderDetailsController.orderDetails.orderPage)
userRouter.delete('/orderDetails/detetOrder/:orderId/',middleware.middlewares.userSession, orderDetailsController.orderDetails.deleteOrder)
userRouter.get('/orderedProduct',middleware.middlewares.userSession, orderDetailsController.orderDetails.orderedProductView)
userRouter.get('/invoice',middleware.middlewares.userSession, middleware.middlewares.userSession,orderDetailsController.orderDetails.inVoice)
//orderSucess
userRouter.get('/orderSucess', function(req, res, next) {
    res.render('orderSucess', { title: 'Express' }); 
  });

//login
userRouter.get('/login',middleware.middlewares.AuthenticationMiddleware, function(req, res, next) {
    res.render('login', { title: 'Express',errors:{} });
  });    
userRouter.post('/login',userController.loginController)

//sign up
userRouter.get('/signup',middleware.middlewares.AuthenticationMiddleware, function(req, res, next) {
  res.render('signup', { title: 'Express',errors:{} });
}); 
userRouter.post('/signin', userController.signUp);

// forgot password

userRouter.get('/emailverification',middleware.middlewares.AuthenticationMiddleware, userController.emailVerfication)
userRouter.post('/emailverifying',userController.emailverifying)
userRouter.get('/forgotpassword',middleware.middlewares.AuthenticationMiddleware, userController.forgotPassword)
userRouter.post('/changePassword',userController.changePassword)
userRouter.post('/f-otp',middleware.middlewares.AuthenticationMiddleware, userController.resendOtp)
//otp 
const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  });
  
  userRouter.get('/otp', middleware.middlewares.forOtpPage, function (req, res) {
    res.render('otp',  { title: 'otp', otpError: null });
  });
  
  userRouter.post('/otpValidation', limiter, otpController.validateOtp);
  userRouter.post('/resend-otp', otpController.resendOtp)  

  // product list controller
userRouter.get('/productList', productListController.allProducts.showProducts);
userRouter.post('/selectedBrands',productListController.allProducts.selectedBrands)
userRouter.post('/priceRange',productListController.allProducts.priceRange)

  //search navBar2 controller
userRouter.post('/productSearch', navBar2Controller.navBar.search)
userRouter.get('/searchedProduct',productListController.allProducts.showSearchedProducts)

//wishlist 
userRouter.get('/wishlist',middleware.middlewares.userSession,wishlistController.wishList.wishlistPage)
userRouter.post('/addToWishlist', wishlistController.wishList.addToWishlist)
userRouter.get('/deleteWishist/:productId',wishlistController.wishList.delete)

module.exports = userRouter