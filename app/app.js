'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var session = require('express-session');

var bodyParser = require('body-parser');

var routes = require('./routes/index');
var bigcommerce = require('./routes/bigcommerce');
var uuid = require('node-uuid');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
    genid: function(req) {
        return uuid.v4() // use UUIDs for session IDs
    },
    secret: 'bigcommerce-csv-exporter-tool',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 12
    },
    resave: true,
    saveUninitialized: true
}));




//app.use('/', routes);
app.use('/bigcommerce', bigcommerce);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var HTTP_PORT_NUMBER = 8082;
app.listen(HTTP_PORT_NUMBER);
module.exports = app;
