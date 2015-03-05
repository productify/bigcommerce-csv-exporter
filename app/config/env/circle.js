'use strict';

module.exports = {

    "database": {
        "connection": "postgres://ubuntu@localhost/circle_test",
        "pg_host": "localhost",
        "pg_port": 5432,
        "pg_db": "circle_test",
        "pg_user": "ubuntu",
        "pg_pass": ""
    },
    "spreadsheet_server": {
        "host": "https://staging.productify.com/api/spreadsheet",
        "port": 80
    },
    "dropbox":{
        "api_key":"a7139eoibhowern",
        "api_secret": "hm39r2zc38v07e4"
    },
    "folders": {
        "api_upload": "./upload"
    },
    "app":{
        "environment":"circle",
        "thumbor_host": "https://staging.productify.com",
        "media_url": "https://staging.productify.com/mediaupload",
        "web_url": "https://staging.productify.com/productflow/"
    },
    "email":{
        "send_enabled": true,
        "mandrill_api_key": "qg3hEttaRLuaWQm45BiM5g",
        "sender":{
            "name": "Productify",
            "email": "app@productify.com"
        }
    },
    "gearman": {
        "host": "localhost",
        "port": 4730
    },
    "socketio": {
        "host": "localhost",
        "port": 8005
    },
    "redis": {
        "host": "localhost",
        "port": 6379,
        "database": 5
    },
    "maxinum_image_tasks": 20480,
    "maximum_products_in_task": 20480,
    "image_skip": true,
    "thumbor": {
        "key": "aqojhdqpa5q33wwz"
    },
    "proxy_image":{
        "size": {
            "width": 1200,
            "height": 1200
        }
    }

};
