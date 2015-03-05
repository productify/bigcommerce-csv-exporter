var schema = require('./postgres_schema');
var moment = require('moment');
var async = require('async');

var BigcommerceToken = schema.define('BigcommerceToken', {
    uid: String,
    access_token: String,
    scope: String,
    user_id: String,
    username: String,
    email: String,
    context: String,
    store_hash: String,
    created_by: String,
    modified_by: String,
    created_at: Date,
    modified_at: Date,
    deleted: { type: Boolean, default: false}
}, {
    table: "bigcommerce_token"
});


BigcommerceToken.beforeCreate = function(next, data) {
    data.uid = schema.uuid();

    data.created_at = moment().format('YYYY-MM-DD HH:mm:ssZ');
    next();
};


BigcommerceToken.beforeUpdate = function(next, data) {

    data.modified_at = moment().format('YYYY-MM-DD HH:mm:ssZ');
    next();
};


module.exports = BigcommerceToken;