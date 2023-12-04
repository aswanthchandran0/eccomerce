// adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminPanelController');
const catagoryController = require('../controller/catagoryController');
const aLoginController = require('../controller/aLoginController');
const adminOrderController = require('../controller/adminOrderController');
const bannerController = require('../controller/bannerController');
const brandingController = require('../controller/brandingController');
const productDetailsController = require('../controller/productDetailsController');
const userDetailsController = require('../controller/userDetails');
const { checkSession } = require('../controller/middleware');
const addCatagoryController = require('../controller/addCatagoryController')
const multer = require('multer')
const path = require('path');
const productController = require('../controller/productController');
const productModel = require('../models/productModel')
const catagoryModel = require('../models/catagoryModel')
const brandData = require('../models/BrandModel')
const adminCouponController = require('../controller/adminCouponController');

//middleware
router.use(checkSession);
// Admin Panel Routes
router.get('/adminPanel', adminController.AdminPanel.adminPanel);
router.get('/adminPanel/logout', adminController.AdminPanel.logout);

// Catagory Routes
router.get('/catagory', catagoryController.catagoryData.getAllCatagory);
router.post('/catagory/delete/:id', catagoryController.catagoryData.deleteCatagory);
router.get('/addCatagory', (req, res) => {
    res.render('addCatagory', { title: 'Express', errors: null });
}); 
router.post('/add' ,addCatagoryController.catagoryData.createCatagory)
// Admin Login Routes
// Add the admin login route
router.post('/adminLogin', aLoginController.validation); // Add the admin login validation route


// Admin Order Routes
router.get('/adminOrder', adminOrderController.orderStatus.orderStatusPage);
router.get('/adminOrder/selectedValue/:selectedValue/orderId/:orderId', adminOrderController.orderStatus.updateOrderStatus);

// Banner Routes
router.get('/banner', bannerController.banner.bannerPage);
router.post('/banner/upload-image', bannerController.banner.handleUpload);
router.get('/banner/delete', bannerController.banner.bannerDeletion);

// Branding Routes
router.get('/branding', brandingController.branding.brandingPage);
router.post('/addBrand', brandingController.branding.addBrand)
router.post('/deleteBrand',brandingController.branding.deleteBrand)

// Product Details Routes
router.get('/productDetails', productDetailsController.product.getAllProduct);
router.post('/productDetails/delete/:id', productDetailsController.product.deleteProduct);

// User Details Routes
router.get('/userDetails', userDetailsController.getAllUser);
router.post('/userDetails/user/block/:id', userDetailsController.blockUser);
router.post('/userDetails/user/unblock/:id', userDetailsController.unblockUser);
router.post('/userDetails/delete/:id', userDetailsController.deleteUser);
router.get('/userDetails/edit/:id', userDetailsController.renderEditUserForm);
router.post('/userDetails/edit/:id', userDetailsController.editUser);
router.get('/userDetails/search', userDetailsController.searchUser);

//addproduct
router.get('/productAdd', async (req, res) => {
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



router.post('/addProduct', upload.array('images', 4), productController.addproduct);  
router.delete('/deleteImage', productController.deleteImage);

// deteting images from product add

router.delete('/deleteImage', productController.deleteImage)

//coupon router
 
router.get('/coupon',adminCouponController.couponController.couponPage);
router.post('/addCoupon',adminCouponController.couponController.couponAdd);

module.exports = router;
