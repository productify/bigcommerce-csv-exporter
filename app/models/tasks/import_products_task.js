var _super = require("./task.js").prototype;

var Bigcommerce = require('../bigcommerce');

var async = require('async');

var method = ImportProductsTask.prototype = Object.create( _super);

method.constructor = ImportProductsTask;

var Config = require('../../config/env/all');

var limit = Config.bigcommerce.limit;

var json2csv = require('json2csv');

var ExportHistory = require('../export_history');

var fs = require('fs');

function ImportProductsTask() {
    _super.constructor.apply( this, arguments );
}

/***
 * Send data to gearman server
 *
 * @param data
 * @param cb
 */
method.send = function(data, cb){
    _super._sendTask.call(this, 'import_products', data, cb);
};



/***
 * Main function to run the task
 *
 * @param job
 * @param cb
 */
method.run = function(sess, cb){

    console.log("Export has started");

    var self = this;

    var product_
    Bigcommerce.getResourceByUrl(sess, 'https://api.bigcommerce.com/stores/' + sess.data.store_hash + '/v2/products/count', function(err, product_count){
        if(product_count && product_count.count){
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

            console.log(pages_array.length);

            pages_array = [1];
            //Get all the products
            //async.forEach(pages_array, function(page, callback){
            async.eachSeries(pages_array, function(page, callback){
                Bigcommerce.getResourceByUrl(sess, 'https://api.bigcommerce.com/stores/' + sess.data.store_hash + '/v2/products/?limit='+ limit +'&page=' + page, function(err, products){
                    if(err) return callback(err);

                    if(products && (products.length > 0)) {
                        products.forEach(function(p){
                            all_products.push(p);
                        });
                    }
                    return callback();
                });

            }, function(err){
                if(err) return cb(err);

                    Bigcommerce.getBrands(sess, all_products,  function(err, all_products){
                        if(err){
                            return cb(err);
                        }

                        Bigcommerce.getCategories(sess, all_products, function(err, all_products){
                            if(err){
                                return cb(err);
                            }




                            Bigcommerce.getSKUs(sess, all_products, function(err, all_products){
                                if(err){
                                    return cb(err);
                                }



                                Bigcommerce.getImages(sess, all_products, function(err, all_products){
                                    if(err){
                                        return cb(err);
                                    }



                                    Bigcommerce.cleanFields(all_products, function(err, all_products){
                                        if(err){
                                            return cb(err);
                                        }


                                        Bigcommerce.getHeaderFields(all_products, function(err, header_fields){
                                            if(err){
                                                return cb(err);
                                            }

                                            Bigcommerce.getProductsData(all_products, header_fields, function(err, products_data){
                                                if(err){
                                                    return cb(err);
                                                }


                                                console.log("Converting json data to CSV");
                                                json2csv({data: products_data, fields: header_fields}, function(err, csv) {
                                                    if (err) return cb(err);
                                                    var date = new Date();

                                                    var feed_directory = 'uploads/exports/'+ sess.data.bigcommerce_token;

                                                    if (!fs.existsSync('public/' + feed_directory)){
                                                        fs.mkdirSync('public/' + feed_directory);
                                                    }
                                                    var feed_url = feed_directory +'/feed.csv';

                                                    console.log("Writing CSV to file");
                                                    fs.writeFile('public/' +  feed_url, csv, function(err) {
                                                        if (err) throw err;

                                                        Bigcommerce.updateFeedUrl(sess, 'public/' +  feed_url, function(err){
                                                            if(err){
                                                                return cb(err);
                                                            }

                                                            console.log("++++++++++++++++++++++++");
                                                            console.log("Export finished");
                                                            console.log("++++++++++++++++++++++++");
                                                            return cb(null);

                                                        });
                                                    });
                                                });
                                            });
                                        });

                                    });
                                });
                            });
                        });
                    });
            });
        }
    });

};

module.exports = ImportProductsTask;