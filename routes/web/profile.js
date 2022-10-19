var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let async = require('async');
const mongoConnection = require('../../utilities/connections');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
const timecalculation = require('../../utilities/timecalculations');
router.get('/', async (req, res) => {
  if (req.session.userid && req.session.userid != null && req.session.userid != '') {
    res.render('profile/create_profile_popup', { title: 'Profile' });
  }else{
    var goto = process.env.APPURI + '/login';
    res.writeHead(302, { 'Location': goto });
    res.end();
  }
});
router.get('/create', async (req, res) => {
  if (req.session.userid && req.session.userid != null && req.session.userid != '') {
    res.render('profile/create', { title: 'Profile' });
  }else{
    var goto = process.env.APPURI + '/login';
    res.writeHead(302, { 'Location': goto });
    res.end();
  }
});
module.exports = router;
