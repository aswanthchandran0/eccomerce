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
const cartController = require('../controller/cartController');
const orderPageController = require('../controller/orderPageController')
const paymentGateway = require('../paymentGateway/RazorPay')
const userProfile = require('../controller/userProfileController')
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
userRouter.get('/cart', middleware.middlewares.userSession, cartController.cartPage);
userRouter.post('/addToCart', cartController.addToCart);
userRouter.get('/deleteCart', middleware.middlewares.userSession, cartController.deleteCart);
userRouter.get('/cart/updatePrice/:quantityChange/:productId/:productPrice', middleware.middlewares.userSession, cartController.updatePrice);
userRouter.get('/cart/orderData/:totalPrice/:subtotalPrice/:shippingPrice/:quantity', cartController.orderData);
userRouter.post('/cart/shippingPrice', middleware.middlewares.userSession, cartController.shippingPrice);
userRouter.get('/cart/processToCheckout', middleware.middlewares.userSession, cartController.processToCheckout);

// Additional cart routes for new functionality
userRouter.post('/cart/updateQuantity', middleware.middlewares.userSession, cartController.updateCartQuantity);
userRouter.post('/cart/removeItem', middleware.middlewares.userSession, cartController.removeFromCart);
userRouter.get('/getCartCount', cartController.getCartCount);

//order
// Checkout page
userRouter.get('/order/order',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.orderPage)
// Coupon routes
userRouter.post('/order/apply-coupon',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.applyCoupon)
userRouter.post('/order/remove-coupon',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.removeCoupon)

// Place order
userRouter.post('/order/order',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.order)

// Clear session discount
userRouter.get('/order/clearSessionDiscount',middleware.middlewares.userSession, orderPageController.order.clearSessionDiscount);

// userRouter.get('/orderSucess',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, orderPageController.order.orderSucess)
userRouter.post('/order/verifyPayment',middleware.middlewares.userSession,middleware.middlewares.orderPageMiddleware, paymentGateway.paymentGateway.verifyPayment)
//userProfile
// userRouter.get('/userProfile',middleware.middlewares.userSession, userProfileController.userProfile.profile,)
// userRouter.post('/userProfile/address',middleware.middlewares.userSession, userProfileController.userProfile.userAddress)
// userRouter.get('/userProfile/signout',middleware.middlewares.userSession, userProfileController.userProfile.signout)
// userRouter.get('/userProfile/orderCancel',middleware.middlewares.userSession, userProfileController.userProfile.cancelOrder)
// userRouter.get('/addressHandler',middleware.middlewares.userSession, userProfileController.userProfile.addressHandler)
// userRouter.post ('/updateAddress',middleware.middlewares.userSession, userProfileController.userProfile.updateAddress)
// User Profile Routes
userRouter.get('/userProfile', middleware.middlewares.userSession, userProfile.dashboard);
userRouter.get('/userProfile/orders', middleware.middlewares.userSession, userProfile.orders);
userRouter.get('/userProfile/wallet', middleware.middlewares.userSession, userProfile.wallet);
userRouter.get('/userProfile/offers', middleware.middlewares.userSession, userProfile.offers);
userRouter.get('/userProfile/addresses', middleware.middlewares.userSession, userProfile.addresses);
userRouter.get('/userProfile/wishlist', middleware.middlewares.userSession, userProfile.wishlist);
userRouter.get('/userProfile/settings', middleware.middlewares.userSession, userProfile.settings);

// Form submissions
userRouter.post('/userProfile/address', middleware.middlewares.userSession, userProfile.userAddress);
userRouter.post('/userProfile/updateAddress', middleware.middlewares.userSession, userProfile.updateAddress);
userRouter.post('/userProfile/deleteAddress', middleware.middlewares.userSession, userProfile.deleteAddress);
userRouter.post('/userProfile/setDefaultAddress', middleware.middlewares.userSession, userProfile.setDefaultAddress); 
userRouter.post('/userProfile/addMoney', middleware.middlewares.userSession, userProfile.addMoneyToWallet);
userRouter.post('/userProfile/cancelOrder', middleware.middlewares.userSession, userProfile.cancelOrder);

// AJAX endpoints
userRouter.get('/addressHandler', middleware.middlewares.userSession, userProfile.addressHandler);

// Sign out
userRouter.post('/userProfile/signout', middleware.middlewares.userSession, userProfile.signout);



//orderDetails
userRouter.get('/orderDetails' ,middleware.middlewares.userSession, orderDetailsController.orderDetails.orderPage)
userRouter.get('/userProfile/orderDetails/:orderId', middleware.middlewares.userSession, orderDetailsController.orderDetails.orderPage);
userRouter.post('/orderDetails/delete/:orderId',middleware.middlewares.userSession, orderDetailsController.orderDetails.deleteOrder)
userRouter.get('/orderedProduct',middleware.middlewares.userSession, orderDetailsController.orderDetails.orderedProductView)
userRouter.get('/orderDetails/invoice',middleware.middlewares.userSession, middleware.middlewares.userSession,orderDetailsController.orderDetails.inVoice)
userRouter.get('/orderDetails/invoice/pdf',middleware.middlewares.userSession, orderDetailsController.orderDetails.generatePDF);
userRouter.post('/order/return/:orderId', middleware.middlewares.userSession, orderDetailsController.orderDetails.requestReturn);

//orderSucess
userRouter.get('/orderSucess', function(req, res, next) {
    res.render('orderSucess', { title: 'Express' }); 
  });

//login
userRouter.get('/login',middleware.middlewares.AuthenticationMiddleware, function(req, res, next) {
    res.render('login', { title: 'Express',errors:{}, formData: { Email: '' }  });
  });    
userRouter.post('/login',userController.loginController)

//sign up
userRouter.get('/signup', middleware.middlewares.AuthenticationMiddleware, function(req, res, next) {
  res.render('signup', { 
    title: 'Express',
    errors: {}, 
    formData: {
      Fname: '',
      Email: '',
      PhoneNumber: '',
      enteredReferalCode: ''
    }
  });
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
    const user = req.session.user || req.session.tempUser;
    res.render('otp', { 
        title: 'OTP Verification', 
        otpError: null,
        user: user || null
    });
});
  
  userRouter.post('/otpValidation', limiter, otpController.validateOtp);
  userRouter.post('/resend-otp', otpController.resendOtp)  

  // product list controller
userRouter.get('/productList', productListController.allProducts.showProducts);
// userRouter.post('/selectedBrands',productListController.allProducts.selectedBrands)
// userRouter.post('/priceRange',productListController.allProducts.priceRange)
userRouter.post('/filterProducts', productListController.allProducts.filterProducts);
// In your routes file, add this route

  //search navBar2 controller
userRouter.post('/productSearch', navBar2Controller.navBar.search)
// userRouter.get('/searchedProduct',productListController.allProducts.showSearchedProducts)

//wishlist 
userRouter.get('/wishlist',middleware.middlewares.userSession,wishlistController.wishList.wishlistPage)
userRouter.post('/addToWishlist', wishlistController.wishList.addToWishlist)
userRouter.get('/deleteWishlist/:productId', wishlistController.wishList.delete);

module.exports = userRouter