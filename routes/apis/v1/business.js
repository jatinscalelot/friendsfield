let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const responseManager = require('../../../utilities/response.manager');
const businessModel = require('../../../models/business.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const timecalculation = require('../../../utilities/timecalculations');
let mongoose = require('mongoose');
router.post('/setbusiness', helper.authenticateToken, async (req, res) => {
  if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){
    let businessupdateData = req.body;
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({userid : mongoose.Types.ObjectId(req.token.userid)}).lean();
    if(businessdata){
      if(businessupdateData.latitude && businessupdateData.longitude){
        businessupdateData.location = { type: "Point", coordinates: [ businessupdateData.longitude, businessupdateData.latitude ] };
        delete businessupdateData.latitude;
        delete businessupdateData.longitude;
        await primary.model(constants.MODELS.business, businessModel).findByIdAndUpdate(businessdata._id, businessupdateData).lean();
        return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
      }else{
        await primary.model(constants.MODELS.business, businessModel).findByIdAndUpdate(businessdata._id, businessupdateData).lean();
        return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
      }
    }else{
      businessupdateData.userid = mongoose.Types.ObjectId(req.token.userid);
      if(businessupdateData.latitude && businessupdateData.longitude){
        businessupdateData.location = { type: "Point", coordinates: [ businessupdateData.longitude, businessupdateData.latitude ] };
        delete businessupdateData.latitude;
        delete businessupdateData.longitude;
        await primary.model(constants.MODELS.business, businessModel).create(businessupdateData);
        return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
      }else{
        await primary.model(constants.MODELS.business, businessModel).create(businessupdateData);
        return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
      }
    }
  }else{
    return responseManager.badrequest({message : 'Invalid token to update user business profile, please try again'}, res);
  }
});
router.get('/getbusiness', helper.authenticateToken, async (req, res) => {
  if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({userid : mongoose.Types.ObjectId(req.token.userid)}).lean();
    if(businessdata){
      return responseManager.onSuccess('User business profile data!', businessdata, res);
    }else{
      return responseManager.badrequest({message : 'Invalid token to fetch user business profile, please try again'}, res);
    }
  }else{
    return responseManager.badrequest({message : 'Invalid token to update user business profile, please try again'}, res);
  }
});
router.post('/businessphoto', async (req, res) => {
});
module.exports = router;