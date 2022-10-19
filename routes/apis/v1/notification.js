let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const notificationModel = require('../../../models/notifications.model');
const businessModel = require('../../../models/business.model');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const multerFn = require('../../../utilities/multer.functions');
const AwsCloud = require('../../../utilities/aws');
const allowedContentTypes = require("../../../utilities/content-types");
const joiValidator = require('../../../models/validators/notificationvalidator');
let mongoose = require('mongoose');
router.post('/create', helper.authenticateToken, async (req, res) => {
    let notificationData = req.body;
    joiValidator.create_notification.validateAsync(notificationData).then( async (validatedNotification) => {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {        
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
            if (businessdata) {
                notificationData.userid = mongoose.Types.ObjectId(req.token.userid);
                notificationData.businessid = mongoose.Types.ObjectId(businessdata._id);
                notificationData.createdBy = mongoose.Types.ObjectId(req.token.userid);
                notificationData.updatedBy = mongoose.Types.ObjectId(req.token.userid);
                await primary.model(constants.MODELS.notifications, notificationModel).create(notificationData);
                return responseManager.onSuccess('Notification created successfully!', 1, res);
            } else {
                return responseManager.unauthorisedRequest(res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to create notification, please try again' }, res);
        }
    }).catch((validateError) => {
        return responseManager.joiBadRequest(validateError, res);
    });
});
router.post('/edit', helper.authenticateToken, async (req, res) => {
    let notificationData = req.body;
    joiValidator.update_notification.validateAsync(notificationData).then( async (validatedNotificationUpdate) => {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
            if (businessdata) {
                let nid = notificationData.notificationid;
                delete notificationData.notificationid;
                notificationData.updatedBy = mongoose.Types.ObjectId(req.token.userid);
                await primary.model(constants.MODELS.notifications, notificationModel).findByIdAndUpdate(nid, notificationData).lean();
                return responseManager.onSuccess('Notification updated successfully!', 1, res);
            } else {
                return responseManager.unauthorisedRequest(res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to update notification, please try again' }, res);
        }
    }).catch((validateError) => {
        return responseManager.joiBadRequest(validateError, res);
    });
});
router.post('/list', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        const { page, limit, search, status, sortfield, sortoption } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
        if (businessdata) {
            primary.model(constants.MODELS.notifications, notificationModel).paginate({
                $or: [
                    { title: { '$regex': new RegExp(search, "i") } },
                    { description: { '$regex': new RegExp(search, "i") } },
                    { link: { '$regex': new RegExp(search, "i") } }
                ],
                userid: mongoose.Types.ObjectId(req.token.userid),
            }, {
                page,
                limit: parseInt(limit),
                sort: { [sortfield]: [sortoption] },
                lean: true
            }).then((notifications) => {
                return responseManager.onSuccess('Notification list!', notifications, res);
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        } else {
            return responseManager.unauthorisedRequest(res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get notification list, please try again' }, res);
    }
});
router.get('/single', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        if (req.query.nid && mongoose.Types.ObjectId.isValid(req.query.nid)){
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
            if (businessdata) { 
                let notificationData = await primary.model(constants.MODELS.notifications, notificationModel).findById(req.query.nid).lean();
                return responseManager.onSuccess('Notification data!', notificationData, res);
            } else {
                return responseManager.unauthorisedRequest(res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid notification id to get notification, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get notification, please try again' }, res);
    }
});
router.post('/setnotificationbanner', helper.authenticateToken,  multerFn.memoryUpload.single("file"), async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            if (req.file) {
                if (allowedContentTypes.imagearray.includes(req.file.mimetype)) {
                    let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
                    if (filesizeinMb <= 10) {
                        AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'notification').then((result) => {
                            var obj = {
                                s3_url: process.env.AWS_BUCKET_URI,
                                Key: result.data.Key
                            };
                            return responseManager.onSuccess('file added successfully...', obj, res);
                        }).catch((err) => {
                            return responseManager.onError(err, res);
                        });
                    } else {
                        return responseManager.badrequest({ message: 'Images files must be less than 10 mb to upload, please try again' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid image file formate for notification banner image, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid image file please upload valid file, and try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid user to upload product image, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to upload product image, please try again' }, res);
    }
});
router.post('/remove', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        if (req.body.nid && mongoose.Types.ObjectId.isValid(req.body.nid)){
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
            if (businessdata) { 
                await primary.model(constants.MODELS.notifications, notificationModel).findByIdAndRemove(req.body.nid);
                return responseManager.onSuccess('Notification deleted successfully!', 1, res);
            } else {
                return responseManager.unauthorisedRequest(res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid notification id to delete notification, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to delete notification, please try again' }, res);
    }
});
module.exports = router;