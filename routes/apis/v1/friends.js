let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const usersModel = require('../../../models/users.model');
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
                    status: { $in: [ 'sent', 'accepted', 'blocked' ] }
                }).lean();
                if (existingFriendRequest == null) {
                    let obj = {
                        senderid: mongoose.Types.ObjectId(userdata._id),
                        receiverid: mongoose.Types.ObjectId(receiverid),
                        message: message,
                        timestamp: Date.now(),
                        status: 'sent'
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
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(checkExisting._id, { status: 'accepted', receiver_scope: authorized_permissions });
                                return responseManager.onSuccess("Friend request accepted successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend request, only sent request can be accepted , please try again' }, res);
                            }
                        } else if (status == 'blocked') {
                            if (checkExisting.status == 'sent') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(checkExisting._id, { status: 'blocked' });
                                return responseManager.onSuccess("Friend blocked successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend, only sent or accepted friends can be blocked, please try again' }, res);
                            }
                        } else if (status == 'rejected') {
                            if (checkExisting.status == 'sent') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(checkExisting._id, { status: 'rejected' });
                                return responseManager.onSuccess("Friend request rejected successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend request, only sent request can be rejected, please try again' }, res);
                            }
                        } else if (status == 'unblocked') {
                            if (checkExisting.status == 'blocked') {
                                await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndRemove(checkExisting._id);
                                return responseManager.onSuccess("Friend unblocked successfully!", 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid status to update friend, only blocked friends can be unblocked, please try again' }, res);
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
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(existingFriendRequest._id, { status: 'blocked' });
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
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(existingFriendRequest._id, { receiver_scope: authorized_permissions });
                        return responseManager.onSuccess("Authorized permissions successfully!", 1, res);
                    } else {
                        await primary.model(constants.MODELS.friendrequests, friendrequestsModel).findByIdAndUpdate(existingFriendRequest._id, { sender_scope: authorized_permissions });
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
module.exports = router;