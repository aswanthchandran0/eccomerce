
const mongoose =require('mongoose')
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session')
require('dotenv').config();
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter');
const createError = require('http-errors');
const app = express();

mongoose.connect(process.env.DB_HOST,{ useNewUrlParser: true,
useUnifiedTopology: true
}).then(() => { 
console.log('dbs connected bro');
}).catch((err) => {
console.error('Error connecting to MongoDB', err);
});

app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
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


app.use('/', userRouter) 
app.use('/admin', adminRouter);
app.use(function(req, res, next) {
  next(createError(404));
}); 

app.use(function(err, req, res, next) {
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};
res.locals.title = 'Error';
  if(err.status ===404){
    res.status(404).render('404error')
  }
  else{
    res.status(err.status || 500);
    res.render('500error');
  }
});

module.exports = app; 