'use strict';

module.exports = {

    "database": {
        "connection": "postgres://productify:productify@localhost/bigcommerce_export",
        "pg_host": "localhost",
        "pg_port": 5432,
        "pg_db": "bigcommerce_export",
        "pg_user": "productify",
        "pg_pass": "productify"
    },
    "spreadsheet_server": {
        "host": "https://staging.productify.com",
        "port": 443
    },
    "dropbox":{
        "api_key":"tn3253wb86z1pzl",
        "api_secret": "zfpt53883n6gaxy"
    },
    "folders": {
        "api_upload": "./upload"
    },
    "app":{
        "environment":"staging",
        "thumbor_host": "https://staging.productify.com",
        "media_url": "https://staging.productify.com/productflow/mediaupload",
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
