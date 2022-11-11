
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const friendrequestsModel = require('../../models/friendrequests.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
let mongoose = require('mongoose');
let async = require('async');
exports.myfriends = async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        const { page, limit, search } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if(userdata){
            primary.model(constants.MODELS.friendrequests, friendrequestsModel).paginate({
                $or: [{ receiverid: mongoose.Types.ObjectId(req.token.userid) }, { senderid: mongoose.Types.ObjectId(req.token.userid) }],
                status : 'accepted'
            }, {
                page,
                limit: parseInt(limit),
                populate: [
                    { path: 'receiverid', model: primary.model(constants.MODELS.users, usersModel)},
                    { path: 'senderid', model: primary.model(constants.MODELS.users, usersModel)}
                ],
                sort: { timestamp : -1 },
                lean: true
            }).then((friendrequests) => {
                let docs = [];
                async.forEachSeries(friendrequests.docs, (friendrequest, next_friendrequest) => {
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
                            };
                            if(friendrequest.receiver_scope.fullname){obj.fullName = friendrequest.receiverid.fullName;}
                            if(friendrequest.receiver_scope.contactnumber){obj.contact_no = friendrequest.receiverid.contact_no;}
                            if(friendrequest.receiver_scope.email){obj.emailId = friendrequest.receiverid.emailId;}
                            if(friendrequest.receiver_scope.dob){obj.dob = friendrequest.receiverid.dob;}
                            if(friendrequest.receiver_scope.gender){obj.gender = friendrequest.receiverid.gender;}
                            if(friendrequest.receiver_scope.socialmedia){obj.socialMediaLinks = friendrequest.receiverid.socialMediaLinks;}
                            docs.push(obj);
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
                            };
                            docs.push(obj);
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
                            };
                            if(friendrequest.sender_scope.fullname){obj.fullName = friendrequest.senderid.fullName;}
                            if(friendrequest.sender_scope.contactnumber){obj.contact_no = friendrequest.senderid.contact_no;}
                            if(friendrequest.sender_scope.email){obj.emailId = friendrequest.senderid.emailId;}
                            if(friendrequest.sender_scope.dob){obj.dob = friendrequest.senderid.dob;}
                            if(friendrequest.sender_scope.gender){obj.gender = friendrequest.senderid.gender;}
                            if(friendrequest.sender_scope.socialmedia){obj.socialMediaLinks = friendrequest.senderid.socialMediaLinks;}
                            docs.push(obj);
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
                            };
                            docs.push(obj);
                        }
                    }
                    next_friendrequest();
                }, () => {
                    let finalResponse = {...friendrequests};
                    finalResponse.docs = docs;
                    return responseManager.onSuccess('Friends list!', finalResponse, res);
                });
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        }else{ 
            return responseManager.badrequest({ message: 'Invalid token to find friends list, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to find friends list, please try again' }, res);
    }
};
