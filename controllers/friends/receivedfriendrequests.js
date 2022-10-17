
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const friendrequestsModel = require('../../models/friendrequests.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
let mongoose = require('mongoose');
let async = require('async');
exports.receivedfriendrequests = async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        const { page, limit, search } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if(userdata){
            primary.model(constants.MODELS.friendrequests, friendrequestsModel).paginate({
                receiverid: mongoose.Types.ObjectId(req.token.userid),
                status : 'sent'
            }, {
                page,
                limit: parseInt(limit),
                populate: [
                    { path: 'senderid', model: primary.model(constants.MODELS.users, usersModel)}
                ],
                sort: { timestamp : -1 },
                lean: true
            }).then((receivedfriendrequests) => {
                let docs = [];
                async.forEachSeries(receivedfriendrequests.docs, (friendrequest, next_friendrequest) => {
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
                        request_message : friendrequest.message,
                        request_id : friendrequest._id
                    };
                    docs.push(obj);
                    next_friendrequest();
                }, () => {
                    let finalResponse = {...receivedfriendrequests};
                    finalResponse.docs = docs;
                    return responseManager.onSuccess('received Friends list!', finalResponse, res);
                });
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        }else{ 
            return responseManager.badrequest({ message: 'Invalid token to get received friends list, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get received friends list, please try again' }, res);
    }
};