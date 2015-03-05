var express = require('express');
var router = express.Router();

var bigcommerce = require('../controllers/bigcommerce');

/* GET home page. */
router.get('/auth', bigcommerce.auth);
router.get('/load', bigcommerce.load);
router.get('/uninstall', bigcommerce.uninstall);
router.get('/new-export', bigcommerce.newExport);

module.exports = router;
