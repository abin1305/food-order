var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');
const fileUpload = require('express-fileupload');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
const db = require('./config/connection');
const session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layout'),
  partialsDir: path.join(__dirname, 'views/partials'),
   helpers: {
    eq: function (a, b) {
      return a === b;
    },
    multiply: function (a, b) {
      return a * b;
    }
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(session({
  secret: 'yourSecretKey',   // 🔐 Replace with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } // Optional: session expires after 10 min
}));

db.connect((err) => {
  if (err) {
    console.log('❌ DB connection error:', err);
  } else {
    console.log('✅ Database connected');
  }
});

app.use('/admin', adminRouter);
app.use('/', usersRouter);

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

module.exports = app;
