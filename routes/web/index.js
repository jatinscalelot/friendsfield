var express = require('express');
var router = express.Router();
router.get('/home', function(req, res, next) {
  res.render('landing', { layout: false, title: "Friends Field" });
});
module.exports = router;
