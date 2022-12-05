let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const usersModel = require('../../../models/users.model');
const businessModel = require("../../../models/business.model");
const friendrequestsModel = require('../../../models/friendrequests.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
let mongoose = require('mongoose');
let myfriendlistCtrl = require('../../../controllers/friends/myfriends');
let receivedfriendRequestCtrl = require('../../../controllers/friends/receivedfriendrequests');
let sentfriendRequestCtrl = require('../../../controllers/friends/sentfriendrequests');
let blockedRequestCtrl = require('../../../controllers/friends/blockedrequest');
router.post('/myfriends', helper.authenticateToken, myfriendlistCtrl.myfriends);
router.post('/receivedfriendrequests', helper.authenticateToken, receivedfriendRequestCtrl.receivedfriendrequests);
router.post('/sentfriendrequests', helper.authenticateToken, sentfriendRequestCtrl.sentfriendrequests);
router.post('/blockedrequest', helper.authenticateToken, blockedRequestCtrl.blockedrequest);
function validateLatLng(lat, lng) {
    let pattern = new RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}');
    return pattern.test(lat) && pattern.test(lng);
};
router.post('/findfriends', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            const { latitude, longitude, search } = req.body;
            if (latitude && longitude && latitude != '' && longitude != '' && latitude != null && longitude != null && validateLatLng(parseFloat(latitude), parseFloat(longitude))) {
                let query = {
                    location: {
                        $geoWithin: {
                            $centerSphere: [
                                [
                                    parseFloat(longitude), parseFloat(latitude)
                                ],
                                (parseInt(userdata.areaRange) * 0.62137119) / 3963.2
                            ]
                        }
                    }
                };
                primary.model(constants.MODELS.users, usersModel).find({
                    _id: { $ne: mongoose.Types.ObjectId(req.token.userid) },
                    $or: [
                        { fullName: { '$regex': new RegExp(search, "i") } },
                        { nickName: { '$regex': new RegExp(search, "i") } },
                        { contact_no: { '$regex': new RegExp(search, "i") } },
                        { userName: { '$regex': new RegExp(search, "i") } },
                    ],
                    ...query
                }).lean().then((result) => {
                    return responseManager.onSuccess("users List", result, res);
                }).catch((error) => {
                    return responseManager.onError(error, res);
                });
            } else {
                if (search && search != '' && search != null) {
                    primary.model(constants.MODELS.users, usersModel).find({
                        _id: { $ne: mongoose.Types.ObjectId(req.token.userid) },
                        $or: [
                            { fullName: { '$regex': new RegExp(search, "i") } },
                            { nickName: { '$regex': new RegExp(search, "i") } },
                            { contact_no: { '$regex': new RegExp(search, "i") } },
                            { userName: { '$regex': new RegExp(search, "i") } },
                        ]
                    }).lean().then((result) => {
                        console.log('result', result);
                        return responseManager.onSuccess("users List", result, res);
                    }).catch((error) => {
                        return responseManager.onError(error, res);
                    });
                }
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to find friends list, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to find friends list, please try again' }, res);
    }
});
router.post('/sendfriendrequest', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            const { receiverid, message } = req.body;
            if (receiverid && receiverid != null && receiverid != '' && mongoose.Types.ObjectId.isValid(receiverid)) {
                let existingFriendRequest = await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findOne({
                    $or: [
                        { $and: [{ receiverid: mongoose.Types.ObjectId(req.token.userid) }, { senderid: mongoose.Types.ObjectId(receiverid) }] },
                        { $and: [{ senderid: mongoose.Types.ObjectId(req.token.userid) }, { receiverid: mongoose.Types.ObjectId(receiverid) }] }
                    ],
                    status: { $in: ['sent', 'accepted', 'blocked'] }
                }).lean();
                if (existingFriendRequest == null) {
                    let obj = {
                        senderid: mongoose.Types.ObjectId(userdata._id),
                        receiverid: mongoose.Types.ObjectId(receiverid),
                        message: message,
                        timestamp: Date.now(),
                        status: 'sent',
                        createdBy: mongoose.Types.ObjectId(userdata._id),
                        updatedBy: mongoose.Types.ObjectId(userdata._id)
                    };
                    await primary.model(constants.MODELS.friendrequests, friendrequestsModel).create(obj);
                    return responseManager.onSuccess("Friend request sent successfully!", 1, res);
                } else {
                    return responseManager.onSuccess("Friend request already sent or received!", 0, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid receiver id to send friends request, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to send friend request, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to send friend request, please try again' }, res);
    }
});
router.post('/updatefriendrequest', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            const { friendrequestid, status, authorized_permissions } = req.body;
            if (friendrequestid && friendrequestid != null && friendrequestid != '' && mongoose.Types.ObjectId.isValid(friendrequestid) && status) {
                if (status == 'accepted' || status == 'blocked' || status == 'rejected' || status == 'unblocked') {
                    let checkExisting = await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findOne({ _id: mongoose.Types.ObjectId(friendrequestid), receiverid: mongoose.Types.ObjectId(req.token.userid) }).lean();
                    if (checkExisting != null) {
                        if (status == 'accepted') {
                            if (checkExisting.status == 'sent') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(checkExisting._id, { status: 'accepted', receiver_scope: authorized_permissions, updatedBy: mongoose.Types.ObjectId(userdata._id) });
                                return responseManager.onSuccess("Friend request accepted successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend request, only sent friend request can be accepted , please try again' }, res);
                            }
                        } else if (status == 'blocked') {
                            if (checkExisting.status == 'sent') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(checkExisting._id, { status: 'blocked', updatedBy: mongoose.Types.ObjectId(userdata._id) });
                                return responseManager.onSuccess("Friend blocked successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend request, only sent or accepted friend request can be blocked, please try again' }, res);
                            }
                        } else if (status == 'rejected') {
                            if (checkExisting.status == 'sent') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(checkExisting._id, { status: 'rejected', updatedBy: mongoose.Types.ObjectId(userdata._id) });
                                return responseManager.onSuccess("Friend request rejected successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend request, only sent friend request can be rejected, please try again' }, res);
                            }
                        } else if (status == 'unblocked') {
                            if (checkExisting.status == 'blocked') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndRemove(checkExisting._id);
                                return responseManager.onSuccess("Friend unblocked successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend request, only blocked friend request can be unblocked, please try again' }, res);
                            }
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid friend request to update, please try again' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid status to update friend request, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid friend request id to update friend request, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to update friend request, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update friend request, please try again' }, res);
    }
});
router.post('/unfriendorblock', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            const { friendid, status } = req.body;
            if (friendid && friendid != null && friendid != '' && mongoose.Types.ObjectId.isValid(friendid) && status && (status == 'unfriend' || status == 'blocked')) {
                let existingFriendRequest = await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findOne({
                    $or: [
                        { $and: [{ receiverid: mongoose.Types.ObjectId(req.token.userid) }, { senderid: mongoose.Types.ObjectId(friendid) }] },
                        { $and: [{ senderid: mongoose.Types.ObjectId(req.token.userid) }, { receiverid: mongoose.Types.ObjectId(friendid) }] }
                    ],
                    status: 'accepted'
                }).lean();
                if (existingFriendRequest) {
                    if (status == 'unfriend') {
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndRemove(existingFriendRequest._id);
                        return responseManager.onSuccess("unfriend successfully!", 1, res);
                    } else if (status == 'blocked') {
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(existingFriendRequest._id, { status: 'blocked', updatedBy: mongoose.Types.ObjectId(userdata._id) });
                        return responseManager.onSuccess("friend blocked successfully!", 1, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid friend id to unfriend a user, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid friend id to unfriend a user, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to unfriend a user, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to unfriend a user, please try again' }, res);
    }
});
router.post('/set_authorized_permissions', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            const { friendid, authorized_permissions } = req.body;
            if (friendid && friendid != null && friendid != '' && mongoose.Types.ObjectId.isValid(friendid)) {
                let existingFriendRequest = await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findOne({
                    $or: [
                        { $and: [{ receiverid: mongoose.Types.ObjectId(req.token.userid) }, { senderid: mongoose.Types.ObjectId(friendid) }] },
                        { $and: [{ senderid: mongoose.Types.ObjectId(req.token.userid) }, { receiverid: mongoose.Types.ObjectId(friendid) }] }
                    ],
                    status: 'accepted'
                }).lean();
                if (existingFriendRequest) {
                    if (existingFriendRequest.receiverid.toString() == req.token.userid.toString()) {
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(existingFriendRequest._id, { receiver_scope: authorized_permissions, updatedBy: mongoose.Types.ObjectId(userdata._id) });
                        return responseManager.onSuccess("Authorized permissions successfully!", 1, res);
                    } else {
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(existingFriendRequest._id, { sender_scope: authorized_permissions, updatedBy: mongoose.Types.ObjectId(userdata._id) });
                        return responseManager.onSuccess("Authorized permissions successfully!", 1, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid friend request to set authorized permission, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid friend id to set authorized permission, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to set authorized permission, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to set authorized permission, please try again' }, res);
    }
});
router.post('/getone', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if (userdata) {
            const { friendid } = req.body;
            if (friendid && friendid != null && friendid != '' && mongoose.Types.ObjectId.isValid(friendid)) {
                let friendrequest = await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findOne({
                    $or: [{ senderid: mongoose.Types.ObjectId(req.token.userid), receiverid: mongoose.Types.ObjectId(friendid) },
                    { senderid: mongoose.Types.ObjectId(friendid), receiverid: mongoose.Types.ObjectId(req.token.userid) }]
                }).populate([
                    { path: 'receiverid', model: primary.model(constants.MODELS.users, usersModel)},
                    { path: 'senderid', model: primary.model(constants.MODELS.users, usersModel)}
                ]).lean();
                if (friendrequest && friendrequest != null) {
                    let businessData = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(friendid) }).select('_id businessimage name category subCategory description location interestedCategory interestedSubCategory brochure').lean();
                    if(friendrequest.senderid._id.toString() == req.token.userid.toString()){
                        if(friendrequest.receiver_scope){
                            let obj = {
                                _id : friendrequest.receiverid._id,
                                aboutUs : friendrequest.receiverid.aboutUs,
                                areaRange : friendrequest.receiverid.areaRange,
                                hobbies : friendrequest.receiverid.hobbies,
                                nickName : friendrequest.receiverid.nickName,
                                userName : friendrequest.receiverid.userName,
                                age : friendrequest.receiverid.age,
                                interestedin : friendrequest.receiverid.interestedin,
                                profileimage : friendrequest.receiverid.profileimage,
                                status : friendrequest.status,
                                createdAt : friendrequest.createdAt,
                                updatedAt : friendrequest.updatedAt,
                                timestamp : friendrequest.timestamp,
                                business : businessData
                            };
                            if(friendrequest.receiver_scope.fullname){obj.fullName = friendrequest.receiverid.fullName;}
                            if(friendrequest.receiver_scope.contactnumber){obj.contact_no = friendrequest.receiverid.contact_no;}
                            if(friendrequest.receiver_scope.email){obj.emailId = friendrequest.receiverid.emailId;}
                            if(friendrequest.receiver_scope.dob){obj.dob = friendrequest.receiverid.dob;}
                            if(friendrequest.receiver_scope.gender){obj.gender = friendrequest.receiverid.gender;}
                            if(friendrequest.receiver_scope.socialmedia){obj.socialMediaLinks = friendrequest.receiverid.socialMediaLinks;}
                            return responseManager.onSuccess("User data", obj, res);
                        }else{
                            let obj = {
                                _id : friendrequest.receiverid._id,
                                contact_no : friendrequest.receiverid.contact_no,
                                aboutUs : friendrequest.receiverid.aboutUs,
                                areaRange : friendrequest.receiverid.areaRange,
                                emailId : friendrequest.receiverid.emailId,
                                fullName : friendrequest.receiverid.fullName,
                                hobbies : friendrequest.receiverid.hobbies,
                                nickName : friendrequest.receiverid.nickName,
                                socialMediaLinks : friendrequest.receiverid.socialMediaLinks,
                                userName : friendrequest.receiverid.userName,
                                age : friendrequest.receiverid.age,
                                gender : friendrequest.receiverid.gender,
                                dob : friendrequest.receiverid.dob,
                                interestedin : friendrequest.receiverid.interestedin,
                                profileimage : friendrequest.receiverid.profileimage,
                                status : friendrequest.status,
                                createdAt : friendrequest.createdAt,
                                updatedAt : friendrequest.updatedAt,
                                timestamp : friendrequest.timestamp,
                                business : businessData
                            };
                            return responseManager.onSuccess("User data", obj, res);
                        }
                    }else{
                        if(friendrequest.sender_scope){
                            let obj = {
                                _id : friendrequest.senderid._id,
                                aboutUs : friendrequest.senderid.aboutUs,
                                areaRange : friendrequest.senderid.areaRange,
                                hobbies : friendrequest.senderid.hobbies,
                                nickName : friendrequest.senderid.nickName,
                                userName : friendrequest.senderid.userName,
                                age : friendrequest.senderid.age,
                                interestedin : friendrequest.senderid.interestedin,
                                profileimage : friendrequest.senderid.profileimage,
                                status : friendrequest.status,
                                createdAt : friendrequest.createdAt,
                                updatedAt : friendrequest.updatedAt,
                                timestamp : friendrequest.timestamp,
                                business : businessData
                            };
                            if(friendrequest.sender_scope.fullname){obj.fullName = friendrequest.senderid.fullName;}
                            if(friendrequest.sender_scope.contactnumber){obj.contact_no = friendrequest.senderid.contact_no;}
                            if(friendrequest.sender_scope.email){obj.emailId = friendrequest.senderid.emailId;}
                            if(friendrequest.sender_scope.dob){obj.dob = friendrequest.senderid.dob;}
                            if(friendrequest.sender_scope.gender){obj.gender = friendrequest.senderid.gender;}
                            if(friendrequest.sender_scope.socialmedia){obj.socialMediaLinks = friendrequest.senderid.socialMediaLinks;}
                            return responseManager.onSuccess("User data", obj, res);
                        }else{
                            let obj = {
                                _id : friendrequest.senderid._id,
                                contact_no : friendrequest.senderid.contact_no,
                                aboutUs : friendrequest.senderid.aboutUs,
                                areaRange : friendrequest.senderid.areaRange,
                                emailId : friendrequest.senderid.emailId,
                                fullName : friendrequest.senderid.fullName,
                                hobbies : friendrequest.senderid.hobbies,
                                nickName : friendrequest.senderid.nickName,
                                socialMediaLinks : friendrequest.senderid.socialMediaLinks,
                                userName : friendrequest.senderid.userName,
                                age : friendrequest.senderid.age,
                                gender : friendrequest.senderid.gender,
                                dob : friendrequest.senderid.dob,
                                interestedin : friendrequest.senderid.interestedin,
                                profileimage : friendrequest.senderid.profileimage,
                                status : friendrequest.status,
                                createdAt : friendrequest.createdAt,
                                updatedAt : friendrequest.updatedAt,
                                timestamp : friendrequest.timestamp,
                                business : businessData
                            };
                            return responseManager.onSuccess("User data", obj, res);
                        }
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid friend id to get user details, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid friend id to get user details, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to get user details, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get user details, please try again' }, res);
    }
});
module.exports = router;