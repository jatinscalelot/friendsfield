var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  res.render('landing', { layout: false, title: "Friends Field" });
});
module.exports = router;
