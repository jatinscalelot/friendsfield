var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let async = require('async');
const mongoConnection = require('../../utilities/connections');
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
router.post('/', async (req, res) => {
  if (req.session.userid && req.session.userid != null && req.session.userid != '') {
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.session.userid).lean();
    if (userdata) {
      userdata.AWS_BUCKET_URI = process.env.AWS_BUCKET_URI;
      return responseManager.onSuccess('User profile data!', userdata, res);
    } else {
      return responseManager.badrequest({ message: 'Invalid token to fetch user profile, please try again' }, res);
    }
  }else{
    var goto = process.env.APPURI + '/login';
    res.writeHead(302, { 'Location': goto });
    res.end();
  }
});
module.exports = router;
