const express = require('express');
const adminRoute = express()
const bodyParser = require('body-parser');
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin' )
const adminController = require('../controller/AdminPanelController');
const catagoryController = require('../controller/catagoryController');
const aLoginController = require('../controller/adminLoginController');
const adminOrderController = require('../controller/adminOrderController');
const bannerController = require('../controller/bannerController');
const brandingController = require('../controller/brandingController');
const productDetailsController = require('../controller/productDetailsController');
const userDetailsController = require('../controller/userDetails');
const multer = require('multer')
const path = require('path');
const productController = require('../controller/productController');
const productModel = require('../models/productModel')
const catagoryModel = require('../models/catagoryModel')
const brandData = require('../models/BrandModel')
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
   
// Catagory Routes
adminRoute.get('/catagory', catagoryController.catagoryData.getAllCatagory);
adminRoute.post('/catagory/delete/:id', catagoryController.catagoryData.deleteCatagory);
adminRoute.get('/addCatagory', (req, res) => {
    res.render('addCatagory', { title: 'Express', errors: null });
}); 
adminRoute.post('/addCategory' ,catagoryController.catagoryData.addCategory)
// Admin Login Routes
// Add the admin login route
adminRoute.get('/adminLogin',middlewares.middlewares.AuthenticationMiddleware, aLoginController.loginPage)
adminRoute.post('/adminLogin',middlewares.middlewares.AuthenticationMiddleware,aLoginController.validation); // Add the admin login validation route


// Admin Order Routes
adminRoute.get('/adminOrder', adminOrderController.orderStatus.orderStatusPage);
adminRoute.get('/adminOrder/selectedValue/:selectedValue/orderId/:orderId', adminOrderController.orderStatus.updateOrderStatus);
adminRoute.get('/adminProductView',adminOrderController.orderStatus.adminProductView)
// Branding Routes
adminRoute.get('/branding', brandingController.branding.brandingPage);
adminRoute.post('/addBrand', brandingController.branding.addBrand)
adminRoute.post('/deleteBrand',brandingController.branding.deleteBrand)

// Product Details Routes
adminRoute.get('/productDetails', productDetailsController.product.getAllProduct);
adminRoute.post('/productDetails/delete/:id', productDetailsController.product.deleteProduct);

// User Details Routes
adminRoute.get('/userDetails', userDetailsController.getAllUser);
adminRoute.post('/userDetails/user/block/:id', userDetailsController.blockUser);
adminRoute.post('/userDetails/user/unblock/:id', userDetailsController.unblockUser);
adminRoute.post('/userDetails/delete/:id', userDetailsController.deleteUser);
adminRoute.get('/userDetails/edit/:id', userDetailsController.renderEditUserForm);
adminRoute.post('/userDetails/edit/:id', userDetailsController.editUser);
adminRoute.get('/userDetails/search', userDetailsController.searchUser);

//addproduct
adminRoute.get('/productAdd', async (req, res) => {
    const ProductId = req.query.id;
    const Catagories = await catagoryModel.find({});
    const brands = await brandData.find({})

    let product = {}; // Initialize product as an empty object
    if (ProductId) {
        product = await productModel.findById(ProductId);
    }

    res.render('productAdd', { brands,Catagories, product, errors: {} });
});


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



adminRoute.post('/addProduct', upload.array('images', 4), productController.addproduct);  
adminRoute.delete('/deleteImage', productController.deleteImage);
adminRoute.delete('/deleteUpdatingImage', productController.deleteUpdatingImage);

// deteting images from product add



//product edit
adminRoute.get('/editProduct',productController.editProductPage)

adminRoute.post('/updateProduct', upload.array('images', 4), productController.updateProduct);

//coupon router
 
adminRoute.get('/coupon',adminCouponController.couponController.couponPage);
adminRoute.post('/addCoupon',adminCouponController.couponController.couponAdd);

// banner

const bannerStorage = multer.diskStorage({
    destination: function(req,res,cb){
        cb(null,'bannerImages/');
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})

const bannerUploads = multer({storage:bannerStorage})

adminRoute.get('/banner', bannerController.banner.bannerPage)
adminRoute.post('/addBanner',bannerUploads.single('image'), bannerController.banner.addBanner)
adminRoute.get('/deleteBanner',bannerController.banner.deleteBanner)

// sales report
adminRoute.get('/sales',salesReportcontroller.sales.loadPage)
adminRoute.get('/salesfilter',salesReportcontroller.sales.filter)
module.exports =adminRoute
