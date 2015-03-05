/**
 * Created by jacky on 22/10/2014.
 */
/**
 * Created by jacky on 22/10/2014.
 */
'use strict';

module.exports = {

    "database": {
        "connection": "postgres://productify:productify@localhost/productify",
        "pg_host": "localhost",
        "pg_port": 5432,
        "pg_db": "bigcommerce_export",
        "pg_user": "productify",
        "pg_pass": "productify"
    },
    "spreadsheet_server": {
        "host": "http://localhost",
        "port": 8086
    },
    "dropbox":{
        "api_key":"tn3253wb86z1pzl",
        "api_secret": "zfpt53883n6gaxy"
    },
    "folders": {
        "api_upload": "./upload"
    },
    "app":{
        "environment":"development",
        "thumbor_host": "http://localhost:8000",
        "media_url": "http://localhost:8000/productflow_mediaupload",
        "web_url": "http://localhost:8000/productflow/"
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
    },
    "redis": {
        "host": "localhost",
        "port": 6379,
        "database": 5
    }
};