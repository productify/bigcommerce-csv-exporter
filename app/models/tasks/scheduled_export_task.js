var BigcommerceToken = require('../bigcommerce_token');

var ImportProductsTask = require('./import_products_task');

var async = require('async')


module.exports.run = function(done){
    var self = this;
    BigcommerceToken.all({ where: {
        deleted: false
    }}, function(err, stores){
        if(err)  return done(err);

        if(!stores) return done(err);

        var d = new Date();
        var now = d.getHours();

        async.forEach(stores, function(store, callback){
            if(store.hour == now){
                var sess = {
                    bigcommerce_token: store.access_token,
                    store_hash: store.store_hash,
                    user_id: store.user_id
                }

                if(sess.bigcommerce_token){
                    var task = new ImportProductsTask();

                    task.send(sess, function(){

                    });
                }
                else{
                    return callback('Bigcommerce token missing. Please try refreshing page');
                }
            }
            return callback();
        }, function(err){
            if(err){
                return done(err);
            }

            return done();;
        });
    });
}