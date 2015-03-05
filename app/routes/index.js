var express = require('express');
var router = express.Router();

var bigcommerce = require('../controllers/bigcommerce');

/* GET home page. */
router.get('/', bigcommerce.getList);

module.exports = router;
