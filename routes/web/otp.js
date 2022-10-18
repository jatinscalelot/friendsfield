var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.userid && req.session.userid != null && req.session.userid != '') {
    // go to home page
  } else {
    if(req.session.contact_no && req.session.contact_no != null && req.session.contact_no != ''){
      res.render('login', { layout: false, title: "Login" });
    }else{
      // got to login page
    }
  }
});

module.exports = router;
