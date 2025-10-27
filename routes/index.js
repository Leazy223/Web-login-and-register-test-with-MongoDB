var express = require('express');
var router = express.Router();
const auth = require('../middlewares/auth');

/* GET home page. */
router.get('/', auth.checkLoginSession, function(req, res, next) {
  res.render('index', { title: 'Chào mừng đến với 3T' });
});

module.exports = router;
