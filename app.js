

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet'); 
const cors = require('cors');
var session = require('express-session')
const {checkSession,checkUserStatus} = require('./controller/middleware')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const mongoose =require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/dress_eccomerse',{ useNewUrlParser: true,
useUnifiedTopology: true
}).then(() => {
console.log('dbs connected bro');
}).catch((err) => {
console.error('Error connecting to MongoDB', err);
})


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login'); 
var AdminPanelRouter = require('./routes/AdminPanel')
var otpRouter = require('./routes/otp')
var userDetailsRouter = require('./routes/userDetails');
var productAddRouter = require('./routes/productAdd')
var adminLoginRouter = require('./routes/adminLogin')
var categoryRouter = require('./routes/catagory')
var addCatagoryRouter = require('./routes/addCatagory')
var productDetailsRouter = require('./routes/productDetails')
var productListRouter = require('./routes/productList')
var productViewRouter = require('./routes/productView')
var userProfileRouter = require('./routes/userProfile')
var cartRouter = require('./routes/cart')
var orderRouter = require('./routes/orderPage')
var orderSucessRouter = require('./routes/orderSucess'); 
var orderDetailsRouter = require('./routes/orderDetails')
const { product } = require('./controller/productDetailsController');
var app = express();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));


//app.use(upload.single('productImage'));
//app.use(express.static('public'));
///////
//app.use(express.static(path.join(__dirname, 'javascripts')));
///////

app.use((req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));



/*app.use(helmet.contentSecurityPolicy({
  directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "ajax.example.com", "localhost:3000", "code.jquery.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "localhost:3000", "stackpath.bootstrapcdn.com"],
      // ... other directives
  } 
}));

*/

app.use(session({
  secret: 'Key',
  cookie:{maxAge:24* 60 * 60 * 1000 , httpOnly:true},
  resave: false,
  saveUninitialized: true
}))

 
app.use('/',checkUserStatus, indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/AdminPanel',checkSession, AdminPanelRouter);
app.use('/otp',otpRouter)
app.use('/userDetails',checkSession,userDetailsRouter)
app.use('/productAdd',checkSession,productAddRouter)
app.use('/adminLogin',   adminLoginRouter)
app.use('/catagory',checkSession, categoryRouter)
app.use('/addCatagory',checkSession, addCatagoryRouter)
app.use('/productDetails',checkSession, productDetailsRouter)
app.use('/productList', productListRouter)
app.use('/productView',productViewRouter)
app.use('/userProfile',userProfileRouter)
app.use('/cart',cartRouter)
app.use('/order', orderRouter)
app.use('/orderSucess', orderSucessRouter);
app.use('/orderDetails', orderDetailsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
}); 

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = 'Error';
  // render the error page

  if(err.status ===404){
    res.status(404).render('404error')
  }
  else{

    res.status(err.status || 500);
    res.render('error');

  }
 
});



module.exports = app;
