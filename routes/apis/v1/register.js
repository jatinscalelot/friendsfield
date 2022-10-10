let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const responseManager = require('../../../utilities/response.manager');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const timecalculation = require('../../../utilities/timecalculations');
router.post('/sendotp', async (req, res) => {
    const { contactNo, countryCode } = req.body;
    if(contactNo && contactNo != '' && contactNo != null && contactNo.length > 9 && countryCode && countryCode != '' && countryCode != null){
        let mobileno = countryCode+contactNo;
        let otp = Math.floor(1000 + Math.random() * 9000);
        client.messages.create({
            from: process.env.TWILIO_MOBILE,
            to: '+'+mobileno,
            body: "Your OTP: " + otp.toString()
        }).then(async (response) => {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ conatct_no: mobileno }).lean();
            if(userdata != null){
                let obj = {
                    last_sent_otp : otp.toString(),
                    otp_timestamp : Date.now()
                };
                await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, obj);
            }else{
                let obj = {
                    conatct_no : mobileno,
                    last_sent_otp : otp.toString(),
                    otp_timestamp : Date.now()
                };
                await primary.model(constants.MODELS.users, usersModel).create(obj);
            }
            let accessToken = await helper.generateAccessToken({ conatct_no : mobileno });
            return responseManager.onSuccess('Otp sent successfully!', {token : accessToken}, res);
        }).catch((error) => {
            return responseManager.onError(error, res);
        });
    }else{
        return responseManager.badrequest({message : 'Invalid contact number please try again'}, res);
    }
});
router.post('/verifyotp', helper.authenticateToken, async (req, res) => {
    if(req.token.conatct_no && req.body.otp && req.body.otp != '' && req.body.otp != null && req.body.otp.length == 4){
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ conatct_no: req.token.conatct_no }).lean();
        if(userdata) {
            if(timecalculation.timedifferenceinminutes(Date.now(), userdata.otp_timestamp) <= 2){
                if(req.body.otp.toString() == userdata.last_sent_otp){
                    let accessToken = await helper.generateAccessToken({ userid : userdata._id.toString() });
                    return responseManager.onSuccess('Otp verified successfully!', {token : accessToken}, res);
                }else{
                    return responseManager.badrequest({message : 'Invalid token to verify user OTP, please try again'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Verification token expires, please try again'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid token to verify user OTP, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid otp, please try again'}, res);
    }
});
module.exports = router;