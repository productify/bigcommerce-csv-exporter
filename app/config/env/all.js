/**
 * Created by jacky on 22/10/2014.
 */
'use strict';

module.exports = {
    app: {
        title: 'ProductFlow',
        description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
        keywords: 'express, nodejs, passport'
    },
    port: process.env.PORT || 8082,
    "bigcommerce": {
        "client_id" : "ryd0jmewbasfj6z17q24pbeakn0ufo7",
        "client_secret" : "ggeb5kqmuchojlkhs86k3xry0y6gz7w",
        "callback_url" : "https://staging.productify.com/bigcommerce/auth",
        "api_url": "https://api.bigcommerce.com/stores/",
        "limit": 250
    }
};
