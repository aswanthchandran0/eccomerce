const express = require('express');
const adminRoute = express()
const bodyParser = require('body-parser');
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin' )
const adminController = require('../controller/AdminPanelController');
const categoryController = require('../controller/categoryController');
const aLoginController = require('../controller/adminLoginController');
const adminOrderController = require('../controller/adminOrderController');
const bannerController = require('../controller/bannerController');
const brandingController = require('../controller/brandingController');
const productDetailsController = require('../controller/productDetailsController');
const userDetailsController = require('../controller/userDetails');
const multer = require('multer')
const path = require('path');
const productController = require('../controller/productController');
const adminCouponController = require('../controller/adminCouponController');
const salesReportcontroller = require('../controller/salesReportController')
const middlewares = require('../middlewares/adminMiddleware')
//middleware
adminRoute.use((req,res,next)=>{
     console.log('Request path:', req.path);
    if(req.path.includes('/adminLogin'|| req.path.includes('/login'))){
        next()
    }else{
        middlewares.middlewares.adminSession(req, res, next);
    }
})


// Admin Panel Routes
adminRoute.get('/', adminController.AdminPanel.adminPanel)
adminRoute.get('/adminPanel', adminController.AdminPanel.adminPanel);
adminRoute.get('/adminPanel/logout', adminController.AdminPanel.logout);
   

// Admin Login Routes
// Add the admin login route
adminRoute.get('/adminLogin',middlewares.middlewares.AuthenticationMiddleware, aLoginController.loginPage)
adminRoute.post('/adminLogin',middlewares.middlewares.AuthenticationMiddleware,aLoginController.validation); // Add the admin login validation route


// Admin Order Routes
adminRoute.get('/adminOrder', adminOrderController.orderStatus.orderStatusPage);
adminRoute.get('/adminProductView',adminOrderController.orderStatus.adminProductView)
adminRoute.post('/update-order-status', adminOrderController.orderStatus.updateOrderStatus);
adminRoute.get('/order-stats', adminOrderController.orderStatus.getOrderStats);
adminRoute.delete('/delete-order/:orderId', adminOrderController.orderStatus.deleteOrder);
adminRoute.get('/order-details/:orderId', adminOrderController.orderStatus.getOrderDetails); //
// Branding Routes
adminRoute.post('/brands',brandingController.branding.addBrand)
adminRoute.put('/brands/:id',brandingController.branding.editBrand)
adminRoute.patch('/brands/:id',brandingController.branding.toggleBrandStatus)
adminRoute.get('/brands', brandingController.branding.brandingPage);
adminRoute.get('/brands/:id') 
// Catagory Routes
adminRoute.post('/categories',categoryController.category.addCategory)
adminRoute.put('/categories/:id',categoryController.category.editCategory)
adminRoute.patch('/categories/:id',categoryController.category.toggleCategoryStatus)
adminRoute.get('/categories', categoryController.category.categoryPage);
adminRoute.get('/categories/:id')

// Product Details Routes
adminRoute.get('/productDetails', productDetailsController.product.getAllProduct);
adminRoute.put('/productDetails/:id/toggle-block', productDetailsController.product.toggleProductStatus);

// User Details Routes
adminRoute.get('/userDetails', userDetailsController.getAllUser);
adminRoute.post('/userDetails/user/block/:id', userDetailsController.blockUser);
adminRoute.post('/userDetails/user/unblock/:id', userDetailsController.unblockUser);
adminRoute.post('/userDetails/delete/:id', userDetailsController.deleteUser);
adminRoute.get('/userDetails/edit/:id', userDetailsController.renderEditUserForm);
adminRoute.post('/userDetails/edit/:id', userDetailsController.editUser);
adminRoute.get('/userDetails/search', userDetailsController.searchUser);

//addproduct
adminRoute.get('/productAdd', productController.productCreationPage);


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads/')
    },
    filename: function (req,file,cb){
       const  uniqueSuffix = Date.now() + '-'+Math.round(Math.random()* 1E9)
       cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({storage:storage})




// CREATE a product
adminRoute.post(
  '/products',
  upload.array('images', 4),
  productController.createProduct
);

// UPDATE a product
adminRoute.put(
  '/products/:id',
  upload.array('images', 4),
  productController.updateProduct
);

// Delete an image (AJAX)
adminRoute.delete("/products/:id/images", productController.deleteUpdatingImage);

adminRoute.get(
  '/products/:id',
  productController.productEditPage
)

//coupon router
 
adminRoute.get('/coupon',adminCouponController.couponController.couponPage);
adminRoute.post('/addCoupon',adminCouponController.couponController.couponAdd);
adminRoute.post('/coupon/:id/toggle', adminCouponController.couponController.toggleCouponStatus);
adminRoute.delete('/coupon/:id/delete', adminCouponController.couponController.deleteCoupon);

// banner 

const bannerStorage = multer.diskStorage({
    destination: function(req,res,cb){
        cb(null,'uploads/banners');
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})

const bannerUploads = multer({storage:bannerStorage})

adminRoute.get('/banners', bannerController.banner.bannerPage)
adminRoute.post('/banners',bannerUploads.single('image'), bannerController.banner.addBanner)
adminRoute.put('/banners/:id',bannerController.banner.editBanner)
adminRoute.delete('/banners/:id',bannerController.banner.deleteBanner)
// adminRoute.get('/deleteBanner',bannerController.banner.deleteBanner)

// sales report
adminRoute.get('/sales',salesReportcontroller.sales.loadPage)
adminRoute.get('/salesfilter',salesReportcontroller.sales.filter)
module.exports =adminRoute
