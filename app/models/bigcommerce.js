/**
 * Created by jacky on 2/05/2014.
 */
"use strict";

var request = require('request');

var config = require('../config/env/all')

var client_id = config.bigcommerce.client_id;

var client_secret = config.bigcommerce.client_secret;

var callback_url = config.bigcommerce.callback_url;
var api_url = config.bigcommerce.api_url;

var BigcommerceToken = require('./bigcommerce_token');

var async = require('async')


var secureCompare = function(str1, str2){
    var res = str1 ^ str2;
    var ret = str1.length ^ str2.length; //not the same length, then fail ($ret != 0)
    for(var i = res.length - 1; i >= 0; i--)
        ret += res[i].charCodeAt(0);
    return ret;
};

module.exports = {
    /***
     * Get Token from big commerce
     *
     * @param code
     * @param scope
     * @param context
     * @param cb
     */
    getToken : function(code, scope, context, cb){

        var data = {
            client_id : client_id,
            client_secret : client_secret,
            redirect_uri : callback_url,
            grant_type : 'authorization_code',
            code : code,
            scope : scope,
            context : context
        };

        request.post({
            url:     'https://login.bigcommerce.com/oauth2/token',
            form:    data
        }, function(err, response, body){
            if(err) return cb(err);



            if(response.statusCode == 200){
                console.log(body);
                body = JSON.parse(body);
                var bt = new BigcommerceToken({
                    access_token: body.access_token,
                    scope: body.scope,
                    user_id: body.user.id,
                    username: body.user.username,
                    email: body.user.email,
                    context: body.context,
                    store_hash: body.context.replace('stores/','')         //should make another request to get the store hash
                });

                bt.save(function(err){
                    if(err) return cb(err);

                    return cb(null, bt);
                });
            }else{
                return cb('Wrong http response: ' + response.statusCode);
            }
        });
    },


    /***
     * Verify the signed payload
     *
     * @param signed_payload
     * @returns {boolean}
     */
    verify : function(signed_payload, cb){

        var self = this;

        var arr = signed_payload.split('.');

        var encodedJson = new Buffer(arr[0], 'base64').toString();

        var data = JSON.parse(encodedJson);     //data

        var crypto = require('crypto');

        var signer = crypto.createHmac('sha256', new Buffer(client_secret));
        var result = signer.update(arr[0]).digest('hex');

        if(secureCompare(new Buffer(arr[1], 'base64').toString(), result)){
            console.log('Bad Signed JSON signature!');
            return cb(null, false);
        }
        console.log(data);
        BigcommerceToken.findOne({ where: {
            user_id: data.user.id,
            email: data.user.email,
            context: data.context,
            deleted: false
        }, order: 'created_at desc' }, function(err, bt){
            if(err) return cb(err);

            if(!bt) return cb('Token not found');

            return cb(null, bt);
        });
    },
    getResourceByUrl : function(sess, url, cb){
        var self = this;

        var options = {
            'headers':{
                'X-Auth-Client': client_id,
                'X-Auth-Token': sess.data.bigcommerce_token,
                'Accept': 'application/json'
            },
            'timeout': 300000
        };

        if(url){
            request.get(url, options , function(err, response, body){
                if(err) return cb(err);

                console.log(url + ":" + response.statusCode);
                console.log("x-bc-apilimit-remaining:" +  response.caseless.dict["x-bc-apilimit-remaining"]);

                if(response.caseless.dict["x-bc-apilimit-remaining"] == 0){
                    setTimeout(function() {
                        self.getResourceByUrl(sess, url);
                    }, 30000);
                }

                if(response.statusCode == 409){
                    setTimeout(function() {
                        self.getResourceByUrl(sess, url);
                    }, response.caseless.dict["X-Retry-After"] * 1000);
                }

                if([200, 201, 202, 204].indexOf(response.statusCode) > -1){
                    if(response.statusCode == 204) return cb();

                    try{
                        return cb(null, JSON.parse(body));

                    }catch(e){
                        console.error('JSON.parse ' + e.message);
                        return cb();
                    }
                }else{
                    return cb('3. Wrong response from big commerce: ' + response.statusCode + '[' + body + ']');
                }
            });
        }
        else{
            return cb();
        }

    },

    getBrand: function(sess, product, cb){
        var self = this;

        if(!product.brand) return cb();

        console.log("Requesting " + product.brand.url);
        self.getResourceByUrl(sess, product.brand.url, function(err, resource_data){
            if(err) return cb(err);

            if(resource_data && resource_data.name){
                product.brand = resource_data.name;
            }
            else{
                product.brand = '';
            }

            return cb();
        });
    },

    getImages: function(sess, all_products, cb){
        var self = this;

        async.eachLimit(all_products, 5,  function(product, callback){
            if(!product.images || !product.images.url) return callback();

            self.getResourceByUrl(sess, product.images.url, function(err, images){
                if(err) return callback(err);

                if(images && images.length){
                    console.log(images.length);

                    for(var i = 0 ; i < images.length; i++){
                        product['image_' + (i+1)] = images[i].zoom_url;
                    }
                }
                return callback();
            });
        }, function(err){
            if(err) return cb(err);

            return cb(null, all_products);
        });
    },

    getSKUs: function(sess, all_products, cb){
        var self = this;

        var all_products_with_sku = [];

        async.eachLimit(all_products, 5,  function(product, callback){
            if(!product.skus) return callback();

            self.getResourceByUrl(sess, product.skus.url, function(err, resource_data){
                if(err) return callback(err);

                var skus = [];
                product.skus = [];
                if(resource_data && (resource_data.length > 0)){
                    for(var i = 0; i < resource_data.length; i++){
                        skus[i] = {};
                        skus[i].sku =  resource_data[i].sku;
                        skus[i].cost_price =  resource_data[i].cost_price;
                        skus[i].upc =  resource_data[i].upc;
                        skus[i].inventory_level =  resource_data[i].inventory_level;

                        product.skus[i] = skus[i];
                    }
                    all_products_with_sku.push(product);
                }




                return callback();
            });
        }, function(err){
            if(err) return cb(err);

            return cb(null, all_products_with_sku);
        });
    },
    getHeaderFields: function(all_products, cb){
        console.log("Generating headers");
        var header_fields = [];
        var max_images = 0;

        async.forEach(all_products, function(product, callback){

            for(var property in product){
                property = property.toLowerCase();

                if(property == 'skus'){
                    for(var prop in product.skus[0]){
                        if(header_fields.indexOf(prop) == -1){
                            header_fields.push(prop);
                        }
                    }
                }
                else {
                    if(header_fields.indexOf(property) == -1){
                        header_fields.push(property);
                    }
                }
            }

            return callback();

        }, function(err){
            if(err) return cb(err);

            return cb(null, header_fields);
        });

        return header_fields;
    },
    getMainProductRow:function(product, header_fields){
        var product_row = {};
        for(var property in product){
            for(var j = 0; j < header_fields.length; j++){
                if(property == header_fields[j]){
                    product_row[header_fields[j]] = product[header_fields[j]]?product[header_fields[j]]:'';
                }
            }
        }
        return product_row;
    },
    getProductsData: function(all_products, header_fields, cb){

        var self = this;

        var final_products = [];


        async.forEach(all_products, function(product, callback){

                var main_product_row = self.getMainProductRow(product, header_fields);
                if(main_product_row){
                    if(main_product_row.sku){
                        final_products.push(main_product_row);
                    }
                }

                for(var property in product){
                    property = property.toLowerCase();

                    if(property == 'skus'){
                        for(var j = 0; j < product[property].length; j++){
                            var product_row = self.getMainProductRow(product, header_fields);

                            for(var prop in product[property][j]){
                                prop = prop.toLowerCase();

                                for(var k = 0; k < header_fields.length; k++){
                                    if((header_fields[k] == prop)){
                                        if(product[property][j][prop] != ""){
                                            product_row[prop] = product[property][j][prop]?product[property][j][prop]:"";
                                        }
                                    }
                                }
                            }
                            if(product_row.sku){
                                final_products.push(product_row);
                            }
                        }
                    }
                }
            return callback();
        }, function(err){
            if(err) return cb(err);

            return cb(null, final_products);
        });
    },
    updateTime: function(sess, store_data, cb){
        BigcommerceToken.findOne({ where: {
            user_id: sess.user_id,
            deleted: false
        }}, function(err, store){
            if(err) return cb(err);

            if(!store) return cb('Invalid token');

            store.hour = store_data.hour;
            store.min = store_data.min;

            store.save(function(err){
                if(err) return cb(err);

                return cb(null, store);
            });

        });
    },
    storeDetails: function(user_id, cb){
        BigcommerceToken.findOne({ where: {
            user_id: user_id,
            deleted: false
        }}, function(err, store){
            if(err) return cb(err);



            if(!store) return cb('Invalid token');

            store.save(function(err){
                if(err) return cb(err);

                return cb(null, store);
            });

        });
    },
    updateFeedUrl: function(sess, feed_url, cb){

        BigcommerceToken.findOne({ where: {
            user_id: sess.data.user_id,
            deleted: false
        }}, function(err, store){
            if(err) return cb(err);

            if(!store) return cb('Invalid token');

            store.feed_url = feed_url;

            store.save(function(err){
                if(err) return cb(err);

                return cb(null, store);
            });

        });
    },
    getBrands: function(sess, all_products, cb){
        var self = this;
        self.getResourceByUrl(sess, 'https://api.bigcommerce.com/stores/' + sess.data.store_hash + '/v2/brands?limit=250', function(err, brands){
            if(err) return cb(err);

            if(brands)
            {
                for(var i = 0 ; i < all_products.length; i++){
                    for(var j = 0; j < brands.length; j++){
                        //Get brand id

                        if(all_products[i].brand && all_products[i].brand.resource){
                            var resource = all_products[i].brand.resource;
                            var slash_index = resource.lastIndexOf("/")
                            var brand_id = resource.substring(slash_index + 1);

                            if(brand_id == brands[j].id){
                                all_products[i].brand = brands[j].name;
                            }
                        }
                    }

                    if(all_products[i].brand.resource){
                        all_products[i].brand = '';
                    }
                }
            }
            return cb(null, all_products);
        });
    },
    getCategories: function(sess, all_products, cb){
        var self = this;
        self.getResourceByUrl(sess, 'https://api.bigcommerce.com/stores/' + sess.data.store_hash + '/v2/categories?limit=250', function(err, categories){
            if(err) return cb(err);

            if(categories)
            {
                for(var i = 0 ; i < all_products.length; i++){

                    var cat_arr = all_products[i].categories.slice();

                    for(var j = 0; j < categories.length; j++){
                           for(var k = 0; k < cat_arr.length; k++){
                               if(cat_arr[k] == categories[j].id){

                                   if(k == 0){
                                       all_products[i].categories =  categories[j].name;
                                   }
                                   else{
                                       all_products[i].categories =  all_products[i].categories + ', ' + categories[j].name;
                                   }

                               }
                           }
                    }

                }
            }
            return cb(null, all_products);
        });
    },
    cleanFields: function(all_products, cb){
        var clean_products = [];
        for(var i = 0; i < all_products.length; i++){
            clean_products[i] = {};
            for(var property in all_products[i]){

                if(
                    (property != 'id') &&
                    (property != 'keyword_filter') &&
                    (property != 'type') &&
                    (property != 'cost_price') &&
                    (property != 'sort_order') &&
                    (property != 'related_products') &&
                    (property != 'tax_class') &&
                    (property != 'rules') &&
                    (property != 'option_set') &&
                    (property != 'options') &&
                    (property != 'configurable_fields') &&
                    (property != 'custom_fields') &&
                    (property != 'videos') &&
                    (property != 'rating_total') &&
                    (property != 'rating_count') &&
                    (property != 'total_sold') &&
                    (property != 'date_created') &&
                    (property != 'view_count') &&
                    (property != 'meta_keywords') &&
                    (property != 'meta_description') &&
                    (property != 'layout_file') &&
                    (property != 'is_price_hidden') &&
                    (property != 'price_hidden_label') &&
                    (property != 'date_modified') &&
                    (property != 'event_date_field_name') &&
                    (property != 'event_date_type') &&
                    (property != 'event_date_start') &&
                    (property != 'event_date_end') &&
                    (property != 'myob_asset_account') &&
                    (property != 'myob_income_account') &&
                    (property != 'myob_expense_account') &&
                    (property != 'peachtree_gl_account') &&
                    (property != 'is_condition_shown') &&
                    (property != 'preorder_release_date') &&
                    (property != 'is_preorder_only') &&
                    (property != 'preorder_message') &&
                    (property != 'order_quantity_minimum') &&
                    (property != 'order_quantity_maximum') &&
                    (property != 'open_graph_type') &&
                    (property != 'open_graph_title') &&
                    (property != 'open_graph_description') &&
                    (property != 'is_open_graph_thumbnail') &&
                    (property != 'avalara_product_tax_code') &&
                    (property != 'date_last_imported') &&
                    (property != 'tax_class_id') &&
                    (property != 'option_set_display') &&
                    (property != 'bin_picking_number') &&
                    (property != 'downloads') &&
                    (property != 'discount_rules') &&
                    (property != 'configurable_fields') &&
                    (property != 'resource') &&
                    (property != 'rules') &&
                    (property != 'tax_class') &&
                    (property != 'discount_rules') &&
                    (property != 'images') &&
                    (property != 'option_set_id')
                    ){

                    if(property == 'primary_image'){
                        clean_products[i][property] =  all_products[i].primary_image.zoom_url;
                    }
                    else{
                       clean_products[i][property] = all_products[i][property];
                    }
                }
            }
        }
        return cb(null, clean_products);
    }
};