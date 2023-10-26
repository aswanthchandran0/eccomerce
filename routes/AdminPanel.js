var express = require('express');
var router = express.Router();
var controller = require('../controller/AdminPanelController')
var {checkSession} = require('../controller/middleware')



router.get('/',checkSession, (req, res, next)=> {
  res.render('AdminPanel', { title: 'Express' });
});

router.get('/logout',checkSession, controller.AdminPanel.logout)

module.exports = router;
