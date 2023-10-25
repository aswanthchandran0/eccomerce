var express = require('express');
var router = express.Router();
const User = require('../models/userModel'); 

const userDetailsController = require('../controller/userDetails'); // Adjust the path based on your project structure

router.get('/', userDetailsController.getAllUser);
router.post('/user/block/:id', userDetailsController.blockUser);
router.post('/user/unblock/:id', userDetailsController.unblockUser);

router.post('/delete/:id', userDetailsController.deleteUser);

router.get('/edit/:id', userDetailsController.renderEditUserForm);

router.post('/edit/:id', userDetailsController.editUser);
router.get('/search', userDetailsController.searchUser)
module.exports = router;




