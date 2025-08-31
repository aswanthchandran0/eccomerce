
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
const flash = require("connect-flash")
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
console.log("Static path:", path.join(__dirname, "public"));
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

app.use(flash())

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRouter) 
app.use('/admin', adminRouter);
app.use(function(req, res, next) {
  next(createError(404));
}); 

app.use((err,req,res,next)=>{
  // Build structured error details
  const errorDetails = {
    timestamp: new Date().toISOString(),
    function: err.function || "unknown", // If you tagged your error with a function name
    errorType: err.name || "ServerError",
    message: err.message,
    stack: err.stack,
    input: {
      body: req.body,
      params: req.params,
      query: req.query
    }
  };

   // Log to console (or later you can plug this into a logger like Winston/Morgan)
  console.error(`[${errorDetails.timestamp}] Error in ${errorDetails.function}`);
  console.error(errorDetails);

   // Set locals for EJS
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.locals.title = "Error";

    // Handle 404 separately
  if (err.status === 404) {
    return res.status(404).render("404error", { message: "Page not found!" });
  }

   // Handle 500 and other server errors
  res.status(err.status || 500);
  res.render("500error", {
    message: "Something went wrong! Please try again later."
  });

});

module.exports = app; 