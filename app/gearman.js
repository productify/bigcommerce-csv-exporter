"use strict";

//process.setMaxListeners(0);

var Config = require('./config/env/all');

var Gearman = require("node-gearman");

var gearman = new Gearman(Config.gearman.host, Config.gearman.port);

var params = [];

process.argv.forEach(function(val, index, array) {
    params.push(val);
});

var taskName = params[2];

process.on('uncaughtException', function ( err ) {
    console.error('An uncaughtException was found, the program will end.');
    console.error(err.stack);
    //hopefully do some logging.
    //process.exit(1);
});

/***
 * Catalog products Validation
 */
if(!taskName || taskName == 'import_products'){
    console.info('Start import products task');

    gearman.registerWorker("import_products", function(payload, worker){
        if(!payload){
            worker.error();
            return;
        }
        var ImportProductsTask = require('./models/tasks/import_products_task');

        var task = new ImportProductsTask();

        var data = JSON.parse(payload);

        task.run({data: data}, function(err){
            if(err) console.log(err);

            worker.end();

        });
    });

}