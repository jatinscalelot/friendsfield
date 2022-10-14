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
    res.render('login', { layout: false, title: "Login" });
  } else {
    res.render('login', { layout: false, title: "Login" });
  }
});
router.post('/sendotp', async (req, res) => {
  if (req.session.userid && req.session.userid != null && req.session.userid != '') {
    res.render('login', { layout: false, title: "Login" });
  } else {
    const { contactNo, countryCode } = req.body;
    if (contactNo && contactNo != '' && contactNo != null && contactNo.length > 9 && countryCode && countryCode != '' && countryCode != null) {
      let mobileno = countryCode + contactNo;
      let otp = Math.floor(1000 + Math.random() * 9000);
      client.messages.create({
        from: process.env.TWILIO_MOBILE,
        to: '+' + mobileno,
        body: otp.toString() + " is the OTP for FreindsField Registration, This otp valid for 2 minutes"
      }).then(async (response) => {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ conatact_no: mobileno }).lean();
        if (userdata != null) {
          let obj = {
            last_sent_otp: otp.toString(),
            otp_timestamp: Date.now()
          };
          await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, obj);
        } else {
          let obj = {
            conatact_no: mobileno,
            last_sent_otp: otp.toString(),
            otp_timestamp: Date.now()
          };
          await primary.model(constants.MODELS.users, usersModel).create(obj);
        }
        let accessToken = await helper.generateAccessToken({ conatact_no: mobileno });
        return responseManager.onSuccess('Otp sent successfully!', { token: accessToken }, res);
      }).catch((error) => {
        return responseManager.onError(error, res);
      });
    }else{
      return responseManager.onSuccess('Unable to send OTP, Contact number or country code invalid, Please try again!', 0, res);
    }
  }
});
module.exports = router;
