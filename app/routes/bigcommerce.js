var express = require('express');
var router = express.Router();

var bigcommerce = require('../controllers/bigcommerce');

/* GET home page. */

router.get('/', bigcommerce.storeDetails);
router.get('/auth', bigcommerce.auth);
router.get('/load', bigcommerce.load);
router.get('/uninstall', bigcommerce.uninstall);
router.get('/new-export/:store_hash', bigcommerce.newExport);
router.post('/update-time', bigcommerce.updateTime);

module.exports = router;
