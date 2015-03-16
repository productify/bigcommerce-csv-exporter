/**
 * Created by jacky on 22/10/2014.
 */
'use strict';

module.exports = {
    app: {
        title: 'CSV Exporter',
        description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
        keywords: 'express, nodejs, passport',
        url: 'http://localhost:8000/'
    },
    port: process.env.PORT || 8082,
    "bigcommerce": {
        //"client_id" : "ryd0jmewbasfj6z17q24pbeakn0ufo7",
        //"client_secret" : "ggeb5kqmuchojlkhs86k3xry0y6gz7w",
        //"client_id" : "i23q4pmgidekwk9vei9hck6n56fg76n",
        //"client_secret" : "3tfboyjz0857me6oj2shbqapoa2vbrv",
        "client_id" : "dnh51ldzg9t4gi1qfe2arnah1fr3s93",
        "client_secret" : "g1rz31cxws4cx8fjfadmk98f7e0ifij",
        "callback_url" : "https://staging.productify.com/bigcommerce/auth",
        "api_url": "https://api.bigcommerce.com/stores/",
        "limit": 250
    },
    "gearman": {
        "host": "localhost",
        "port": 4730
    }
};
