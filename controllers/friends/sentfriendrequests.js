
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const friendrequestsModel = require('../../models/friendrequests.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
let mongoose = require('mongoose');
let async = require('async');
exports.sentfriendrequests = async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        const { page, limit, search } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if(userdata){
            primary.model(constants.MODELS.friendrequests, friendrequestsModel).paginate({
                senderid: mongoose.Types.ObjectId(req.token.userid),
                status : { $in : ['sent', 'rejected' ] },
                $or: [
                    { message: { '$regex': new RegExp(search, "i") } },
                ]
            }, {
                page,
                limit: parseInt(limit),
                populate: [
                    { path: 'receiverid', model: primary.model(constants.MODELS.users, usersModel)},
                ],
                sort: { timestamp : -1 },
                lean: true
            }).then((sentfriendrequests) => {
                let docs = [];
                async.forEachSeries(sentfriendrequests.docs, (friendrequest, next_friendrequest) => {
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
                        request_message : friendrequest.message,
                        request_id : friendrequest._id
                    };
                    docs.push(obj);
                    next_friendrequest();
                }, () => {
                    let finalResponse = {...sentfriendrequests};
                    finalResponse.docs = docs;
                    return responseManager.onSuccess('Sent Friendrequests list!', finalResponse, res);
                });
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        }else{ 
            return responseManager.badrequest({ message: 'Invalid token to find sent friend requests list, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to find sent friend requests list, please try again' }, res);
    }
};