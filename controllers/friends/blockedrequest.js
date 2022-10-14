
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const friendrequestsModel = require('../../models/friendrequests.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
let mongoose = require('mongoose');
let async = require('async');
exports.blockedrequest = async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        const { page, limit, search } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if(userdata){
            primary.model(constants.MODELS.friendrequests, friendrequestsModel).paginate({
                $or: [{ receiverid: mongoose.Types.ObjectId(req.token.userid) }, { senderid: mongoose.Types.ObjectId(req.token.userid) }],
                status : 'blocked'
            }, {
                page,
                limit: parseInt(limit),
                populate: [
                    { path: 'receiverid', model: primary.model(constants.MODELS.users, usersModel)},
                    { path: 'senderid', model: primary.model(constants.MODELS.users, usersModel)}
                ],
                sort: { timestamp : -1 },
                lean: true
            }).then((blockedfriendrequests) => {
                let docs = [];
                async.forEachSeries(blockedfriendrequests.docs, (friendrequest, next_friendrequest) => {
                    if(friendrequest.senderid._id.toString() == req.token.userid.toString()){
                        let obj = {
                            _id : friendrequest.receiverid._id,
                            conatact_no : friendrequest.receiverid.conatact_no,
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
                            profileimage : friendrequest.receiverid.profileimage
                        };
                        docs.push(obj);
                    }else{
                        let obj = {
                            _id : friendrequest.senderid._id,
                            conatact_no : friendrequest.senderid.conatact_no,
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
                            profileimage : friendrequest.senderid.profileimage
                        };
                        docs.push(obj);
                    }
                    next_friendrequest();
                }, () => {
                    let finalResponse = {...blockedfriendrequests};
                    finalResponse.docs = docs;
                    return responseManager.onSuccess('Blocked Friends list!', finalResponse, res);
                });
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        }else{ 
            return responseManager.badrequest({ message: 'Invalid token to find blocked friends list, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to find blocked friends list, please try again' }, res);
    }
};