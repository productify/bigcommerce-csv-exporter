var Bigcommerce = require('../models/bigcommerce');

var BigcommerceToken = require('../models/bigcommerce_token');


var ExportHistory = require('../models/export_history');
var config = require('../config/env/all')
var async = require('async')

var ImportProductsTask = require('../models/tasks/import_products_task');


var limit = config.bigcommerce.limit;

/***
 * Goto the home page
 * @param res
 */
var gotoIndex = function(req, res){
    res.writeHead(302, {
        Location:  '/bigcommerce/index'
    });

    res.end();
};


module.exports.auth = function(req, res, next){
    var code = decodeURIComponent(req.query.code);

    var scopes = decodeURIComponent(req.query.scope);

    var context = decodeURIComponent(req.query.context);

    console.log('Auth request');

    Bigcommerce.getToken(code, scopes, context, function(err, bt){
        if(err) return next(err);

        gotoIndex(req,res);
    });
}

module.exports.load = function(req, res, next){

    var sess = req.session;

    var signed_payload = req.query.signed_payload;

    if(signed_payload){
        Bigcommerce.verify(signed_payload, function(err, bt){
            if(err){
                return res.send(500, { error: err });
            }

            var sess = req.session

            sess.bigcommerce_token =  bt.access_token;
            sess.store_hash = bt.store_hash;
            sess.user_id = bt.user_id;

            gotoIndex(req, res);
        });
    }else{
        return res.send(500);
    }
}


module.exports.uninstall = function(req, res, next){

    var signed_payload = req.query.signed_payload;

    console.log("Payload")

    console.log(req.query.signed_payload);

    console.log('Uninstall request');

    Bigcommerce.verify(signed_payload, function(err, bt){
        if(err){
            return res.send(500, { error: err });
        }

        bt.deleted = true;
        bt.save(function(err){
            if(err){
                return res.send(500, { error: err });
            }

            res.end();
        });
    });
}

module.exports.getList = function(req, res, next){
    console.log(req.session);
    console.log("+++++++++++++++++++++++++");

    if(req.session && req.session.user_id){
        ExportHistory.getList(req.session.user_id, function(err, exports_data){
            if(err){
                return res.send(500, { error: err });
            }
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
            
            res.render('index', {
                title: 'CSV Exporter',
                exports_data: exports_data
            });
        });
    }
}


module.exports.storeDetails = function(req, res, next){

    if(req.session && req.session.user_id){
        Bigcommerce.storeDetails(req.session.user_id, function(err, store_details){
            if(err){
                return res.send(500, { error: err });
            }
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');


            console.log(store_details);

            res.render('index', {
                title: 'CSV Exporter',
                store_details: store_details
            });
        });
    }
}


module.exports.newExport = function(req, res, next){

    BigcommerceToken.findOne({ where: {
        store_hash: req.params.store_hash,
        deleted: false
    }}, function(err, store){
        if(err)  return res.send(500, { error: err });

        if(!store) return res.send(500, { error: err });

        var sess = {
            bigcommerce_token: store.access_token,
            store_hash: store.store_hash,
            user_id: store.user_id
        }

        if(sess.bigcommerce_token){
            var task = new ImportProductsTask();

            task.send(sess, function(){
                return res.send(200, {});
            });
        }
        else{
            return cb('Bigcommerce token missing. Please try refreshing page');
        }

    });
}

module.exports.updateTime = function(req, res, next){
    Bigcommerce.updateTime(req.session, req.body, function(err, store){
        if(err){
            return res.send(500, { error: err }).end();
        }
        gotoIndex(req, res);
    });
}