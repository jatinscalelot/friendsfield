var express = require('express');
var router = express.Router();
let async = require('async');
router.get('/', async (req, res) => {
  if(req.session.userid && req.session.userid != null && req.session.userid != ''){
    res.render('login', { layout: false, title: "Login" });
  }else{
    res.render('login', { layout: false, title: "Login" });
  }
});
module.exports = router;
