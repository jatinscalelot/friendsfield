var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let async = require('async');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const constants = require('../../utilities/constants');
const timecalculation = require('../../utilities/timecalculations');
/* GET home page. */
router.get('/', async (req, res) => {
  if (req.session.userid && req.session.userid != null && req.session.userid != '') {
    var goto = process.env.APPURI + '/home';
    res.writeHead(302, { 'Location': goto });
    res.end();
  } else {
    if (req.session.contact_no && req.session.contact_no != null && req.session.contact_no != '') {
      res.render('login/verifyotp', { title: "Login", contact_no: req.session.contact_no });
    } else {
      var goto = process.env.APPURI + '/login';
      res.writeHead(302, { 'Location': goto });
      res.end();
    }
  }
});
router.post('/verifyotp', async (req, res) => {
  if (req.session.contact_no && req.session.contact_no != '' && req.body.otp && req.body.otp != '' && req.body.otp != null && req.body.otp.length == 4) {
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ contact_no: req.session.contact_no }).lean();
    if (userdata) {
      if (timecalculation.timedifferenceinminutes(Date.now(), userdata.otp_timestamp) <= 2) {
        if (req.body.otp.toString() == userdata.last_sent_otp) {
          delete userdata.last_sent_otp;
          delete userdata.otp_timestamp;
          await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, { channelID: userdata._id.toString().toUpperCase() }).lean();
          req.session.userid = userdata._id.toString();
          return responseManager.onSuccess('Otp verified successfully!', {channelID: userdata._id.toString().toUpperCase(), contactNo : req.session.contact_no}, res);
        } else {
          return responseManager.badrequest({ message: 'Invalid user to verify user OTP, please try again' }, res);
        }
      } else {
        return responseManager.badrequest({ message: 'Verification token expires, please try again' }, res);
      }
    } else {
      return responseManager.badrequest({ message: 'Invalid user to verify user OTP, please try again' }, res);
    }
  } else {
    return responseManager.badrequest({ message: 'Invalid otp, please try again' }, res);
  }
});
module.exports = router;
