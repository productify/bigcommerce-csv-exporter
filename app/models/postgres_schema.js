"use strict";

var config = require('../config/config');

var Schema = require('jugglingdb').Schema;

var schema = new Schema('postgres', {
    database: config.database.pg_db,
    username: config.database.pg_user,
    password: config.database.pg_pass,
    host: config.database.pg_host,
    port: config.database.pg_port,
    debug: true
});


var util = require("util"),

    events = require('events');

var extendedSchema = function(name, settings){

};

util.inherits(extendedSchema, Schema);

extendedSchema.uuid = function(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

/***
 * Overwrite the define method
 *
 * @param className
 * @param properties
 * @param settings
 * @returns {newly}
 */
extendedSchema.define = function(className, properties, settings){
    var m = schema.define(className, properties, settings);

    /***
     * Find record by UID
     *
     * @param uid
     * @param cb
     */
    m.findById = function(uid, cb){
        m.findOne({ where: {uid : uid, deleted: false} }, function(err, o){
            if(err) return cb(err);

            cb(null, o);
        });
    };

    return m;
};

extendedSchema.client = schema.client;

/***
 * Export the model
 *
 * @type {Function}
 */
module.exports = extendedSchema;

