
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var session = require('express-session')
require('dotenv').config();



const mongoose =require('mongoose')
mongoose.connect(process.env.DB_HOST,{ useNewUrlParser: true,
useUnifiedTopology: true
}).then(() => { 
console.log('dbs connected bro');
}).catch((err) => {
console.error('Error connecting to MongoDB', err);
})
;
var adminLoginRouter = require('./routes/adminLogin')
var userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter');
var app = express();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use('/bannerImages', express.static('bannerImages'))



app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));




app.use(session({
  secret: 'Key',
  cookie:{maxAge:24* 60 * 60 * 1000 , httpOnly:true},
  resave: false,
  saveUninitialized: true
}))

 
app.use('/adminLogin',   adminLoginRouter)
app.use('/', userRouter) 
app.use('/admin', adminRouter);



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
    res.render('500error');

  }
 
});



module.exports = app; 