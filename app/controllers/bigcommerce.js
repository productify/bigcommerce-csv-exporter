var Bigcommerce = require('../models/bigcommerce');
var ExportHistory = require('../models/export_history');
var config = require('../config/env/all')
var async = require('async')
var fs = require('fs');
var json2csv = require('json2csv');

var limit = config.bigcommerce.limit;

/***
 * Goto the home page
 * @param res
 */
var gotoIndex = function(req, res){

    req.session.cookie.expires = false;

//    res.redirect('/');

    res.writeHead(302, {
        Location:  '/bigcommerce/'
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

            var sess = req.session.cookie

            sess.bigcommerce_token =  bt.access_token;
            sess.store_hash = bt.store_hash;
            sess.user_id = bt.user_id;

            console.log("Session info");
            console.log(req.session);

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

    console.log("Session info before export listing");
    console.log(req.session);

    ExportHistory.getList(req.session.cookie.user_id, function(err, exports_data){
        if(err){
            return res.send(500, { error: err });
        }

        res.render('index', {
            title: 'CSV Exporter',
            exports_data: exports_data
        });
    });
}


module.exports.newExport = function(req, res, next){
    var sess = req.session;
    Bigcommerce.getProductsCount(sess, function(err, product_count){
         var count = product_count.count;

         var pages = parseInt(count / limit);
         if(count % limit != 0){
             pages++;
         }
        var all_products = [];

        var pages_array = [];
        for(var i = 1; i <= pages; i++){
            pages_array.push(i);
        }

        var all_products = [];

        async.forEach(pages_array, function(page, callback){
            Bigcommerce.getProducts(limit, page, function(err, products){
                if(err) return callback(err);

                if(all_products.length > 0) {
                    all_products.concat(products);
                }
                else {
                    all_products = products;
                }
                callback();
            });
        }, function(err){
            if(err) return next(err);

            Bigcommerce.getAdditionalData(all_products, function(err){
                if(err){
                    return res.send(500, { error: err });
                }

                var header_fields  = Bigcommerce.getHeaderFields(all_products);

                var products_data = Bigcommerce.getProductsData(all_products, header_fields);


                json2csv({data: products_data, fields: header_fields}, function(err, csv) {
                    if (err) console.log(err);
                    var date = new Date();

                    var export_data = {
                        user_id: sess.user_id,
                        file_url: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 36) + '.csv'
                    }
                    fs.writeFile('uploads/exports/' + export_data.file_url, csv, function(err) {
                        if (err) throw err;

                        ExportHistory.addHistory(export_data, function(err){
                            if(err){
                                return res.send(500, { error: err });
                            }
                        });
                    });
                });
            });
        });
    });
}