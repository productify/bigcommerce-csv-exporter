"use strict";
var ScheduledExportTask = require('../models/tasks/scheduled_export_task');

ScheduledExportTask.run(function(err){
    if(err) console.log(err);

    console.log("++++++++++++++++++++++++++++++++++++++");
    console.log("      Started scheduled export");
    console.log("++++++++++++++++++++++++++++++++++++++");


    setTimeout(function(){
        process.exit(0);
    }, 30000);
});