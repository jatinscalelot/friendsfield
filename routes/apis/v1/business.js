let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const businessModel = require('../../../models/business.model');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const multerFn = require('../../../utilities/multer.functions');
const AwsCloud = require('../../../utilities/aws');
const allowedContentTypes = require("../../../utilities/content-types");
const joiValidator = require('../../../models/validators/businessvalidator');
let mongoose = require('mongoose');
router.post('/setbusiness', helper.authenticateToken, async (req, res) => {
  let businessupdateData = req.body;
  joiValidator.create_business.validateAsync(businessupdateData).then( async (validatedBusinessProfile) => {
    if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){  
      let primary = mongoConnection.useDb(constants.DEFAULT_DB);
      let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({userid : mongoose.Types.ObjectId(req.token.userid)}).lean();
      if(businessdata){
        if(businessupdateData.latitude && businessupdateData.longitude){
          businessupdateData.location = { type: "Point", coordinates: [ businessupdateData.longitude, businessupdateData.latitude ] };
          delete businessupdateData.latitude;
          delete businessupdateData.longitude;
          businessupdateData.updatedBy = mongoose.Types.ObjectId(req.token.userid);
          await primary.model(constants.MODELS.business, businessModel).findByIdAndUpdate(businessdata._id, businessupdateData).lean();
          return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
        }else{
          businessupdateData.updatedBy = mongoose.Types.ObjectId(req.token.userid);
          await primary.model(constants.MODELS.business, businessModel).findByIdAndUpdate(businessdata._id, businessupdateData).lean();
          return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
        }
      }else{
        businessupdateData.userid = mongoose.Types.ObjectId(req.token.userid);
        if(businessupdateData.latitude && businessupdateData.longitude){
          businessupdateData.location = { type: "Point", coordinates: [ businessupdateData.longitude, businessupdateData.latitude ] };
          delete businessupdateData.latitude;
          delete businessupdateData.longitude;
          businessupdateData.createdBy = mongoose.Types.ObjectId(req.token.userid);
          businessupdateData.updatedBy = mongoose.Types.ObjectId(req.token.userid);
          await primary.model(constants.MODELS.business, businessModel).create(businessupdateData);
          return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
        }else{
          businessupdateData.createdBy = mongoose.Types.ObjectId(req.token.userid);
          businessupdateData.updatedBy = mongoose.Types.ObjectId(req.token.userid);
          await primary.model(constants.MODELS.business, businessModel).create(businessupdateData);
          return responseManager.onSuccess('Business Profile updated successfully!', 1, res);
        }
      }
    }else{
      return responseManager.badrequest({message : 'Invalid token to update user business profile, please try again'}, res);
    }
  }).catch((validateError) => {
    return responseManager.joiBadRequest(validateError, res);
  });
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
router.post('/setbusinessprofile', helper.authenticateToken, multerFn.memoryUpload.single("file"), async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
    if (userdata) {
      let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({userid : mongoose.Types.ObjectId(req.token.userid)}).lean();
      if(businessdata){
        if (req.file) {
          if (allowedContentTypes.imagearray.includes(req.file.mimetype)) {
            let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
            if (filesizeinMb <= 10) {
              AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'profile').then((result) => {
                var obj = {
                  s3_url: process.env.AWS_BUCKET_URI,
                  Key: result.data.Key
                };
                primary.model(constants.MODELS.business, businessModel).findByIdAndUpdate(businessdata._id, { businessimage: result.data.Key }).then((updateprofileobj) => {
                  return responseManager.onSuccess('file added successfully...', obj, res);
                }).catch((err) => {
                  return responseManager.onError(err, res);
                });
              }).catch((err) => {
                return responseManager.onError(err, res);
              });
            } else {
              return responseManager.badrequest({ message: 'Images files must be less than 10 mb to upload, please try again' }, res);
            }
          } else {
            return responseManager.badrequest({ message: 'Invalid image file formate for business profile, please try again' }, res);
          }
        } else {
          return responseManager.badrequest({ message: 'Invalid image file please upload valid file, and try again' }, res);
        }
      }else{
        if (req.file) {
          if (allowedContentTypes.imagearray.includes(req.file.mimetype)) {
            let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
            if (filesizeinMb <= 5) {
              AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'profile').then((result) => {
                var obj = {
                  s3_url: process.env.AWS_BUCKET_URI,
                  Key: result.data.Key
                };
                return responseManager.onSuccess('file added successfully...', obj, res);
              }).catch((err) => {
                return responseManager.onError(err, res);
              });
            } else {
              return responseManager.badrequest({ message: 'Images files must be less than 5 mb to upload, please try again' }, res);
            }
          } else {
            return responseManager.badrequest({ message: 'Invalid image file formate for business profile, please try again' }, res);
          }
        } else {
          return responseManager.badrequest({ message: 'Invalid image file please upload valid file, and try again' }, res);
        }
      }
    } else {
      return responseManager.badrequest({ message: 'Invalid user to upload business profile, please try again' }, res);
    }
  } else {
    return responseManager.badrequest({ message: 'Invalid user to upload business profile, please try again' }, res);
  }
});
router.post('/setbrochure', helper.authenticateToken, multerFn.memoryUpload.single("file"), async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
    if (userdata) {
      let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({userid : mongoose.Types.ObjectId(req.token.userid)}).lean();
      if(businessdata){
        if (req.file) {
          if (allowedContentTypes.docarray.includes(req.file.mimetype)) {
            let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
            if (filesizeinMb <= 25) {
              AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'brochure').then((result) => {
                var obj = {
                  s3_url: process.env.AWS_BUCKET_URI,
                  Key: result.data.Key
                };
                primary.model(constants.MODELS.business, businessModel).findByIdAndUpdate(businessdata._id, { brochure: result.data.Key }).then((updateprofileobj) => {
                  return responseManager.onSuccess('file added successfully...', obj, res);
                }).catch((err) => {
                  return responseManager.onError(err, res);
                });
              }).catch((err) => {
                return responseManager.onError(err, res);
              });
            } else {
              return responseManager.badrequest({ message: 'Images files must be less than 25 mb to upload brochure, please try again' }, res);
            }
          } else {
            return responseManager.badrequest({ message: 'Invalid image file formate for business brochure, please try again' }, res);
          }
        } else {
          return responseManager.badrequest({ message: 'Invalid image file please upload valid file, and try again' }, res);
        }
      }else{
        if (req.file) {
          if (allowedContentTypes.docarray.includes(req.file.mimetype)) {
            let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
            if (filesizeinMb <= 25) {
              AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'brochure').then((result) => {
                var obj = {
                  s3_url: process.env.AWS_BUCKET_URI,
                  Key: result.data.Key
                };
                return responseManager.onSuccess('file added successfully...', obj, res);
              }).catch((err) => {
                return responseManager.onError(err, res);
              });
            } else {
              return responseManager.badrequest({ message: 'Images files must be less than 25 mb to upload brochure, please try again' }, res);
            }
          } else {
            return responseManager.badrequest({ message: 'Invalid image file formate for business brochure, please try again' }, res);
          }
        } else {
          return responseManager.badrequest({ message: 'Invalid image file please upload valid file, and try again' }, res);
        }
      }
    } else {
      return responseManager.badrequest({ message: 'Invalid user to upload business brochure, please try again' }, res);
    }
  } else {
    return responseManager.badrequest({ message: 'Invalid user to upload business brochure, please try again' }, res);
  }
});
module.exports = router;