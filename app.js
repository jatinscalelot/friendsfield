const dotenv = require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
let mongoose = require("mongoose");
var expressLayouts = require('express-ejs-layouts');
var session = require("express-session");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
      cookie: { sameSite: "lax", maxAge: oneDay },
      resave: true,
      secret: process.env.WEB_LOGIN_AUTH_TOKEN,
      activeDuration: 5 * 60 * 1000,
      saveUninitialized: true
  })
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/angular", express.static(__dirname + "/node_modules/angular"));
mongoose.set('runValidators', true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
  console.log("Well done! , connected with mongoDB database");
}).on('error', error => {
  console.log("Oops! database connection error:" + error);
});
app.use('/', indexRouter);
// Web App Routers
const webpaths = [
  { pathUrl: '/', routeFile: 'login' },
  { pathUrl: '/otp', routeFile: 'otp' },
  { pathUrl: '/profile', routeFile: 'profile' }
];
webpaths.forEach((path) => {
	app.use(path.pathUrl, require('./routes/web/' + path.routeFile));
});
// Mobile App Routers
const apispaths = [
	{ pathUrl: '/register', routeFile: 'register' },
	{ pathUrl: '/profile', routeFile: 'profile' },
	{ pathUrl: '/business', routeFile: 'business' },
  { pathUrl: '/product', routeFile: 'product' },
  { pathUrl: '/notification', routeFile: 'notification' },
  { pathUrl: '/upload', routeFile: 'upload' },
  { pathUrl: '/friends', routeFile: 'friends' }
];
apispaths.forEach((path) => {
	app.use('/apis/v1' + path.pathUrl, require('./routes/apis/v1/' + path.routeFile));
});
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
// app modules exported
module.exports = app;
