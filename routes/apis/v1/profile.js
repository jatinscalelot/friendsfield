let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const responseManager = require('../../../utilities/response.manager');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const timecalculation = require('../../../utilities/timecalculations');
let mongoose = require('mongoose');
router.post('/setprofile', helper.authenticateToken, async (req, res) => {
  if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
    if(userdata){
      let userupdateData = req.body;
      if(userupdateData.latitude && userupdateData.longitude){
        userupdateData.location = { type: "Point", coordinates: [ userupdateData.longitude, userupdateData.latitude ] };
        delete userupdateData.latitude;
        delete userupdateData.longitude;
        await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, userupdateData).lean();
        return responseManager.onSuccess('Profile updated successfully!', 1, res);
      }else{
        await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, userupdateData).lean();
        return responseManager.onSuccess('Profile updated successfully!', 1, res);
      }
    }else{
      return responseManager.badrequest({message : 'Invalid token to update user profile, please try again'}, res);
    }
  }else{
    return responseManager.badrequest({message : 'Invalid token to update user profile, please try again'}, res);
  }
});
router.get('/getprofile', helper.authenticateToken, async (req, res) => {
  if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
    if(userdata){
      return responseManager.onSuccess('User profile data!', userdata, res);
    }else{
      return responseManager.badrequest({message : 'Invalid token to fetch user profile, please try again'}, res);
    }
  }else{
    return responseManager.badrequest({message : 'Invalid token to update user profile, please try again'}, res);
  }
});
router.post('/profilephoto', async (req, res) => {

});
module.exports = router;