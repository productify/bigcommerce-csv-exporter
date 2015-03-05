'use strict';

module.exports = {

    "database": {
        "connection": "postgres://productify:productify@192.168.3.10:6432/bigcommerce_export",
        "pg_host": "192.168.3.10",
        "pg_port": 6432,
        "pg_db": "bigcommerce_export",
        "pg_user": "productify",
        "pg_pass": "productify"
    },
    "spreadsheet_server": {
        "host": "http://192.168.3.5",
        "port": 8086
    },
    "dropbox":{
        "api_key":"e458ndattc7d6nz",
        "api_secret": "n1bzeeeseyn3slb"
    },
    "folders": {
        "api_upload": "./upload"
    },
    "app":{
        "environment":"production",
        "thumbor_host": "https://staging.productify.com",
        "media_url": "https://media.productify.com/productflow/mediaupload",
        "web_url": "https://app.productflow.io/"
    },
    "email":{
        "send_enabled": true,
        "mandrill_api_key": "qg3hEttaRLuaWQm45BiM5g",
        "sender":{
            "name": "ProductFlow",
            "email": "hello@productflow.io"
        }
    },
    "gearman": {
        "host": "192.168.3.2",
        "port": 4730
    },
    "socketio": {
        "host": "192.168.3.2",
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
