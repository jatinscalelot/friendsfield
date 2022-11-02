let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const responseManager = require('../../../utilities/response.manager');
const usersModel = require('../../../models/users.model');
const businessModel = require('../../../models/business.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const timecalculation = require('../../../utilities/timecalculations');
let mongoose = require('mongoose');
router.post('/sendotp', async (req, res) => {
    const { contactNo, countryCode } = req.body;
    if(contactNo && contactNo != '' && contactNo != null && contactNo.length > 9 && countryCode && countryCode != '' && countryCode != null){
        let mobileno = countryCode+contactNo;
        let otp = '1234';
        //Math.floor(1000 + Math.random() * 9000);
        // console.log('process.env.TWILIO_ACCOUNT_SID', process.env.TWILIO_ACCOUNT_SID);
        // console.log('client', client);
        // client.messages.create({
        //     messaging_service_sid: 'MGcfc060d9482ac8c1591396b038a3ab22',
        //     from: process.env.TWILIO_MOBILE,
        //     to: '+'+mobileno,
        //     body: otp.toString()+" is the OTP for FreindsField Registration, This otp valid for 2 minutes"
        // }).then(async (response) => {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ contact_no: mobileno }).lean();
            if(userdata != null){
                let obj = {
                    last_sent_otp : otp.toString(),
                    otp_timestamp : Date.now()
                };
                await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, obj);
            }else{
                let obj = {
                    contact_no : mobileno,
                    last_sent_otp : otp.toString(),
                    otp_timestamp : Date.now()
                };
                await primary.model(constants.MODELS.users, usersModel).create(obj);
            }
            let accessToken = await helper.generateAccessToken({ contact_no : mobileno });
            return responseManager.onSuccess('Otp sent successfully!', {token : accessToken}, res);
        // }).catch((error) => {
        //     console.log('error', error);
        //     return responseManager.onError(error, res);
        // });
    }else{
        return responseManager.badrequest({message : 'Invalid contact number please try again'}, res);
    }
});
router.post('/verifyotp', helper.authenticateToken, async (req, res) => {
    if(req.token.contact_no && req.body.otp && req.body.otp != '' && req.body.otp != null && req.body.otp.length == 4){
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ contact_no: req.token.contact_no }).lean();
        if(userdata) {
            if(timecalculation.timedifferenceinminutes(Date.now(), userdata.otp_timestamp) <= 2){
                if(req.body.otp.toString() == userdata.last_sent_otp){
                    let accessToken = await helper.generateAccessToken({ userid : userdata._id.toString() });
                    delete userdata.last_sent_otp;
                    delete userdata.otp_timestamp;
                    await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, { channelID : userdata._id.toString().toUpperCase() }).lean();
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
router.post('/changenumber', helper.authenticateToken, async (req, res) => {
    if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){
        const { oldcontactNo, oldcountryCode, newcontactNo, newcountryCode } = req.body;
        if(oldcontactNo && oldcontactNo != '' && oldcontactNo != null && oldcontactNo.length > 9 && oldcountryCode && oldcountryCode != '' && oldcountryCode != null){
            if(newcontactNo && newcontactNo != '' && newcontactNo != null && newcontactNo.length > 9 && newcountryCode && newcountryCode != '' && newcountryCode != null){
                let primary = mongoConnection.useDb(constants.DEFAULT_DB);
                let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
                if(userdata){
                    if(userdata.contact_no == oldcountryCode+oldcontactNo){
                        if(newcountryCode+newcontactNo != oldcountryCode+oldcontactNo){
                            let existingUser = await primary.model(constants.MODELS.users, usersModel).findOne({contact_no : newcountryCode+newcontactNo}).lean();
                            if(existingUser == null){
                                let mobileno = newcountryCode+newcontactNo;
                                let otp = Math.floor(1000 + Math.random() * 9000);
                                client.messages.create({
                                    from: process.env.TWILIO_MOBILE,
                                    to: '+'+mobileno,
                                    body: otp.toString()+" is the OTP for FreindsField New Number Registration, This otp valid for 2 minutes"
                                }).then(async (response) => {
                                   let obj = {
                                        last_sent_otp : otp.toString(),
                                        otp_timestamp : Date.now(),
                                        new_contact_number : mobileno
                                   };
                                   await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(userdata._id, obj);
                                   return responseManager.onSuccess('Otp sent successfully!', 1, res);
                                }).catch((error) => {
                                    return responseManager.onError(error, res);
                                });
                            }else{
                                return responseManager.badrequest({message : 'New number already exist with other user, please try again'}, res);
                            }
                        }else{
                            return responseManager.badrequest({message : 'Old number and new number can not be identical, please try again'}, res);
                        }
                    }else{
                        return responseManager.badrequest({message : 'Invalid Old Number to update, please try again'}, res);
                    }
                }else{
                    return responseManager.badrequest({message : 'Invalid token to update user profile, please try again'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Invalid New Number to update, please try again'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid Old Number to update, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid user token, please try again'}, res);
    }
});
router.post('/verifyotpfornewnumber', helper.authenticateToken, async (req, res) => {
    if(req.token.userid && req.body.otp && req.body.otp != '' && req.body.otp != null && req.body.otp.length == 4){
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if(userdata) {
            if(timecalculation.timedifferenceinminutes(Date.now(), userdata.otp_timestamp) <= 2){
                if(req.body.otp.toString() == userdata.last_sent_otp){
                    let obj = {
                        contact_no : userdata.new_contact_number
                    };
                    await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, obj).lean();
                    await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, { $unset : { new_contact_number : 1} }).lean();
                    return responseManager.onSuccess('Otp verified successfully and new number added successfully!', 1, res);
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