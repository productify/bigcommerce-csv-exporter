/**
 * Created by jacky on 15/10/2014.
 */
'use strict';

var method = Task.prototype;

var Config = require('../../config/env/all');

var Gearman = require("node-gearman");

var gearman = new Gearman(Config.gearman.host, Config.gearman.port);


function Task() {

}


/***
 * Send the task to gearman worker
 *
 * @param name
 * @param data
 * @param cb
 * @returns {*}
 * @private
 */
method._sendTask = function(name, data, cb){

    console.log("Start test");

    var job = gearman.submitJob(name, JSON.stringify(data).toString("utf-8"));

    if(process.env.NODE_ENV != 'test') console.info('Send task to gearman! ' + name + ' [' + JSON.stringify(data) + ']');
    return cb(null, job);
};



//method._logger = logger;



module.exports = Task;