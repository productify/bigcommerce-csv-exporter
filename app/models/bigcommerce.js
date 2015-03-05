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

    store_hash : null,

    bigcommerce_token: null,

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

            console.log(response.statusCode);

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

//            self.store_hash = bt.store_hash;
//            self.bigcommerce_token = bt.access_token;

            return cb(null, bt);
        });
    },

    /***
     *
     * @param method
     * @param resource
     */
    request : function(method, resource, data, cb){

        var fun, self = this;

        switch(method.toLowerCase()){
            case 'post':
                fun = request.post;
                break;
            case 'get':
                fun = request.get;
                break;
            case 'del':
            case 'delete':
                fun = request.del;
                break;
            case 'put':
                fun = request.put;
                break;
        }

        var options = {
            'headers':{
                'X-Auth-Client': client_id,
                'X-Auth-Token': this.bigcommerce_token,
                'content-type': 'application/json',
                'Accept': 'application/json'
            },
            'timeout': 300000
        };

        if(data){
            options.body = JSON.stringify(data);
        }

        fun('https://api.bigcommerce.com/stores/' + self.store_hash + '/v2/' + resource, options
            , function(err, response, body){
                if(err) return cb(err);


                if([200, 201, 202, 204].indexOf(response.statusCode) > -1){
                    if(response.statusCode == 204) return cb();

                    try{
                        return cb(null, JSON.parse(body));
                    }catch(e){
                        console.error('JSON.parse ' + e.message);
                        return cb();
                    }
                }else{
                    return cb('Wrong response from big commerce: ' + response.statusCode + '[' + body + ']' + resource);
                }
            });
    },
    getProducts : function(limit, page, cb){

        var fun, self = this;
        fun = request.get;

        var options = {
            'headers':{
                'X-Auth-Client': client_id,
                'X-Auth-Token': this.bigcommerce_token,
                'Accept': 'application/json'
            },
            'timeout': 300000
        };

        fun('https://api.bigcommerce.com/stores/' + self.store_hash + '/v2/products/?limit='+ limit +'&page=' + page, options
            , function(err, response, body){
                if(err) return cb(err);
                return cb(null, JSON.parse(body));
            });
    },
    getProductsCount : function(sess, cb){

        console.log(sess);

        var self = this;

        var options = {
            'headers':{
                'X-Auth-Client': client_id,
                'X-Auth-Token': sess.cookie.bigcommerce_token,
                'Accept': 'application/json'
            },
            'timeout': 300000
        };

        request.get('https://api.bigcommerce.com/stores/' + sess.store_hash + '/v2/products/count', options
            , function(err, response, body){
                if(err) return cb(err);

                console.log("++++++++++++++++++++++++++++++++");
                console.log("Total product count" + body);
                console.log("++++++++++++++++++++++++++++++++");

                return cb(null, JSON.parse(body));
            });
    },
    getResourceByUrl : function(url, cb){
        var self = this;

        var options = {
            'headers':{
                'X-Auth-Client': client_id,
                'X-Auth-Token': this.bigcommerce_token,
                'Accept': 'application/json'
            },
            'timeout': 300000
        };

        request.get(url, options
            , function(err, response, body){
                if(err) return cb(err);

                if(body){
                    return cb(null, JSON.parse(body));
                }
                else{
                    return cb(null);
                }
            });
    },

    getBrand: function(product, cb){
        var self = this;

        if(!product.brand) return cb();

        self.getResourceByUrl(product.brand.url, function(err, resource_data){
            if(err) return cb(err);

            if(resource_data && resource_data.name){
                product.brand = resource_data.name;
            }
            return cb();
        });
    },

    getImages: function(product, cb){
        var self = this;

        if(!product.images) return cb();

        self.getResourceByUrl(product.images.url, function(err, resource_data){
            if(err) return cb(err);

            for(var i = 0 ; i < resource_data.length; i++){
                product['image_' + (i+1)] = resource_data[i].zoom_url;
            }
            product.images = null;

            return cb();
        });
    },

    getSKUs: function(product, cb){
        var self = this;

        if(!product.skus) return cb();

        self.getResourceByUrl(product.skus.url, function(err, resource_data){
            if(err) return cb(err);
            var skus = [];
            if(resource_data && resource_data.length > 0){
                for(var i = 0; i < resource_data.length; i++){
                    skus[i] = {};
                    skus[i].sku =  resource_data[i].sku;
                    skus[i].cost_price =  resource_data[i].cost_price;
                    skus[i].upc =  resource_data[i].upc;
                    skus[i].inventory_level =  resource_data[i].inventory_level;
                }
            }
            product.skus = skus;

            return cb();
        });
    },

    getCategories: function(product, cb){
        var self = this;

        if(!product.categories.length) return cb();

        var categories = "";
        async.forEach(product.categories, function(category, callback){
            self.getResourceByUrl('https://api.bigcommerce.com/stores/' + self.store_hash + '/v2/categories/' + category, function(err, resource_data){
                if(err) return cb(err);

                if(resource_data)
                {
                    if(categories == ''){
                        categories = resource_data.name;
                    }
                    else{
                        categories = categories + "," + resource_data.name;
                    }
                }
                return callback();
            });
        }, function(err){
            product.categories = categories;
            return cb();
        });
    },

    getAdditionalData: function(all_products, cb){
        var self = this;
        //var final_products = [];

        async.forEach(all_products, function(product, callback){
            product.primary_image = product.primary_image.zoom_url;
            product.discount_rules = null;
            product.downloads = null;
            product.tax_class = null;
            product.rules = null;
            product.option_set = null; //Todo: Need to handle option_set
            product.options = null; //Todo: Need to handle options
            product.configurable_fields = null;
            product.custom_fields = null;
            product.videos = null;

            self.getBrand(product, function(){
                self.getImages(product, function(){
                    self.getSKUs(product, function(){
                        self.getCategories(product, function(){
                            return callback();
                        })
                    });
                });
            });
        }, function(err){
            return cb()
        });


    },
    getHeaderFields: function(products){
        var header_fields = [];
        var max_images = 0;
        for(var property in products[0]){
            property = property.toLowerCase();

            if(property == 'skus'){
                for(var prop in products[0].skus){
                    header_fields.push(prop)
                }
            }
            else{
                header_fields.push(property);
            }
        }

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
    getProductsData: function(products, header_fields){
        var final_products = [];

        for(var i = 0; i < products.length; i++){
            var main_product_row = this.getMainProductRow(products[i], header_fields);
            if(main_product_row){
                if(main_product_row.sku){
                    final_products.push(main_product_row);
                }
            }

            for(var property in products[i]){
                property = property.toLowerCase();

                if(property == 'skus'){
                    for(var j = 0; j < products[i][property].length; j++){
                        var product_row = this.getMainProductRow(products[i], header_fields);

                        for(var prop in products[i][property][j]){
                            prop = prop.toLowerCase();

                            for(var k = 0; k < header_fields.length; k++){
                                if((header_fields[k] == prop)){
                                    if(products[i][property][j][prop] != ""){
                                        product_row[prop] = products[i][property][j][prop]?products[i][property][j][prop]:"";
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
        }
        return final_products;
    }
};