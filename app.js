var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var categoriesRouter = require('./routes/categories');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// Register Handlebars helpers
const hbs = require('hbs');
const helpers = require('./helpers/hbs-helpers');
Object.keys(helpers).forEach(helperName => {
    hbs.registerHelper(helperName, helpers[helperName]);
});
app.set('view engine', 'hbs');

// Basic middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import and configure session
var session = require('express-session');
const timeout = 10000 * 60 * 60 * 24; // 24 hours
app.use(session({
  secret: 'mySecretKey',
  saveUninitialized: true, // Changed this to true
  cookie: { maxAge: timeout },
  resave: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối đến MongoDB
mongoose.connect('mongodb://localhost:27017/web')
  .then(() => console.log('Kết nối đến MongoDB thành công'))
  .catch(err => console.error('Kết nối đến MongoDB thất bại', err));

// Add session username to locals
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  next();
});

// Define all routes
var authRouter = require('./routes/auth');

// Mount all routes
app.use('/auth', authRouter); // Mount auth first
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/users', usersRouter);
app.use('/', indexRouter); // Mount index last as it might have catch-all routes

// API routes
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

PORT = 4000;
app.listen( PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});

module.exports = app;
