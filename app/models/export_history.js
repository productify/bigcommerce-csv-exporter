var schema = require('./postgres_schema');
var moment = require('moment');

var ExportHistory = schema.define('ExportHistory', {
    uid: String,
    user_id: String,
    created_at: Date,
    file_url: String,
    deleted: { type: Boolean, default: false}
}, {
    table: "export_history"
});


ExportHistory.beforeCreate = function(next, data) {
    data.uid = schema.uuid();

    data.created_at = moment().format('YYYY-MM-DD HH:mm:ssZ');
    next();
};


ExportHistory.beforeUpdate = function(next, data) {

    data.modified_at = moment().format('YYYY-MM-DD HH:mm:ssZ');
    next();
};


ExportHistory.addHistory = function(export_data, cb){

    var self = this;

    var data = {
        user_id: export_data.user_id,
        file_url: export_data.file_url
    };

    ExportHistory.create(data, cb);
};

ExportHistory.getList = function(user_id, cb){
    ExportHistory.all({where: {user_id: user_id, deleted: false}}, function(err, eh){
        if(err) return cb(err);

        return cb(err, eh)
    });
};


module.exports = ExportHistory;