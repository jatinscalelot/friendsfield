let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const multerFn = require('../../../utilities/multer.functions');
const AwsCloud = require('../../../utilities/aws');
const allowedContentTypes = require("../../../utilities/content-types");
const joiValidator = require("../../../models/validators/profilevalidator");
let mongoose = require('mongoose');
router.post('/setprofile', helper.authenticateToken, async (req, res) => {
  let userupdateData = req.body;
  joiValidator.create_profile.validateAsync(userupdateData).then( async (validatedProfile) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
      let primary = mongoConnection.useDb(constants.DEFAULT_DB);
      let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
      if (userdata) {
        if (userupdateData.latitude && userupdateData.longitude) {
          userupdateData.location = { type: "Point", coordinates: [userupdateData.longitude, userupdateData.latitude] };
          delete userupdateData.latitude;
          delete userupdateData.longitude;
          await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, userupdateData).lean();
          return responseManager.onSuccess('Profile updated successfully!', 1, res);
        } else {
          await primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, userupdateData).lean();
          return responseManager.onSuccess('Profile updated successfully!', 1, res);
        }
      } else {
        return responseManager.badrequest({ message: 'Invalid token to update user profile, please try again' }, res);
      }
    } else {
      return responseManager.badrequest({ message: 'Invalid token to update user profile, please try again' }, res);
    }
  }).catch((validateError) => {
    return responseManager.joiBadRequest(validateError, res);
  });
});
router.get('/getprofile', helper.authenticateToken, async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
    if (userdata) {
      return responseManager.onSuccess('User profile data!', userdata, res);
    } else {
      return responseManager.badrequest({ message: 'Invalid token to fetch user profile, please try again' }, res);
    }
  } else {
    return responseManager.badrequest({ message: 'Invalid token to update user profile, please try again' }, res);
  }
});
router.post('/setprofilepic', helper.authenticateToken, multerFn.memoryUpload.single("file"), async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
    if (userdata) {
      if (req.file) {
        if (allowedContentTypes.imagearray.includes(req.file.mimetype)) {
          let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
          if (filesizeinMb <= 5) {
            AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'profile').then((result) => {
              var obj = {
                s3_url: process.env.AWS_BUCKET_URI,
                Key: result.data.Key
              };
              primary.model(constants.MODELS.users, usersModel).findByIdAndUpdate(req.token.userid, { profileimage: result.data.Key }).then((updateprofileobj) => {
                return responseManager.onSuccess('file added successfully...', obj, res);
              }).catch((err) => {
                return responseManager.onError(err, res);
              });
            }).catch((err) => {
              return responseManager.onError(err, res);
            });
          } else {
            return responseManager.badrequest({ message: 'Images files must be less than 5 mb to upload, please try again' }, res);
          }
        } else {
          return responseManager.badrequest({ message: 'Invalid image file formate for profile, please try again' }, res);
        }
      } else {
        return responseManager.badrequest({ message: 'Invalid image file please upload valid file, and try again' }, res);
      }
    } else {
      return responseManager.badrequest({ message: 'Invalid user to upload profile, please try again' }, res);
    }
  } else {
    return responseManager.badrequest({ message: 'Invalid user to upload profile, please try again' }, res);
  }
});
module.exports = router;