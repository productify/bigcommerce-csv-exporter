/**
 * Created by jacky on 3/11/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    session = require('express-session'),
//    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    oauthserver = require('oauth2-server'),
//    mongoStore = require('connect-mongo')({
//        session: session
//    }),
//    flash = require('connect-flash'),
    config = require('./config'),
//    consolidate = require('consolidate'),
    path = require('path');

module.exports = function(db) {
    // Initialize express app
    var app = express();

    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
//    app.locals.facebookAppId = config.facebook.clientID;
//    app.locals.jsFiles = config.getJavaScriptAssets();
//    app.locals.cssFiles = config.getCSSAssets();
    app.locals.secure = config.secure;

    // Passing the request url to environment locals
    app.use(function(req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // Should be placed before express.static
//    app.use(compress({
//        filter: function(req, res) {
//            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
//        },
//        level: 9
//    }));

    // Showing stack errors
//    app.set('showStackError', true);

    // Set swig as the template engine
//    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
//    app.set('view engine', 'server.view.html');
//    app.set('views', './app/views');

    // Environment dependent middleware
//    if (process.env.NODE_ENV === 'development') {
//        // Enable logger (morgan)
//        app.use(morgan('dev'));
//
//        // Disable views cache
//        app.set('view cache', false);
//    } else if (process.env.NODE_ENV === 'production') {
//        app.locals.cache = 'memory';
//    }

    var accessLogStream = fs.createWriteStream(__dirname + '/../app.log', {flags: 'a'});

    app.use(morgan('combined', {stream: accessLogStream}))

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
//    app.use(bodyParser());
    app.use(expressValidator());
    app.use(methodOverride());

    // CookieParser should be above session
    app.use(cookieParser());

    // Express MongoDB session storage
//    app.use(session({
//        saveUninitialized: true,
//        resave: true,
//        secret: config.sessionSecret,
//        store: new mongoStore({
//            db: db.connection.db,
//            collection: config.sessionCollection
//        })
//    }));

    // use passport session
//    app.use(passport.initialize());
//    app.use(passport.session());

    // connect flash for flash messages
//    app.use(flash());

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // Setting the app router and static folder
//    app.use(express.static(path.resolve('./public')));





    // Assume 404 since no middleware responded
//    app.use(function(req, res) {
//        res.status(404).render('404', {
//            url: req.originalUrl,
//            error: 'Not Found'
//        });
//    });

    app.oauth = oauthserver({
        model: require('../models/oauth_model'),
        grants: ['password'],
        accessTokenLifetime: 365*24*3600,
        debug: true
    });

//    app.use(function(req,res,next){
//        console.log(req.headers);
//        console.log(req.body);
//        next();
//    });

    // Globbing routing files
    config.getGlobbedFiles('./routes/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

    /***
     * Error handle
     */
    app.use(function(err, req, res, next) {

        if(err.name == 'Application Error'){
            return res.status(500).json(err);
        }else if(err.name == 'OAuth2Error'){

            res.status(401).send(err.message || 'Authentication failed');
        }else{
            if(app.settings.env == 'development'){
                throw new Error(err);
            }else{
                console.error(err);
                console.error('Exception: ' + err.stack);
                res.status(400).end();
            }
        }
    });

    if (app.locals.secure) {
        console.log('Securely using https protocol');
        var https = require('https'),
            privateKey  = fs.readFileSync('./config/sslcert/key.pem', 'utf8'),
            certificate = fs.readFileSync('./config/sslcert/cert.pem', 'utf8'),
            credentials = {key: privateKey, cert: certificate},
            httpsServer = https.createServer(credentials, app);
        return httpsServer;
    } else {
        console.log('Insecurely using http protocol');
        var httpServer = http.createServer(app);
        return httpServer;
    }
};