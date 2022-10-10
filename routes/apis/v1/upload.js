var express = require("express");
var router = express.Router();
const multerFn = require('../../../utilities/multer.functions');
const AwsCloud = require('../../../utilities/aws');
var responseManager = require("../../../utilities/response.manager");
let mongoConnection = require('../../../utilities/connections');
const constants = require("../../../utilities/constants");
const helper = require('../../../utilities/helper');
let usersModel = require('../../../models/users.model');
let mongoose = require('mongoose');
const onlyvideoarray = ['video/x-msvideo', 'video/mp4', 'video/webm', 'audio/webm', 'video/3gpp', 'audio/3gpp', 'video/3gpp2', 'audio/3gpp2'];
const audiovideoarray = ['audio/mpeg', 'audio/aac', 'audio/wav', 'audio/opus', 'audio/amr', 'audio/ogg', 'video/x-msvideo', 'video/mp4', 'video/webm', 'audio/webm', 'video/3gpp', 'audio/3gpp', 'video/3gpp2', 'audio/3gpp2'];
const docarray = ['application/zip', 'text/plain', 'application/vnd.rar', 'application/pdf', 'text/csv',
	'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
	'application/x-tar', 'application/vnd.oasis.opendocument.presentation',
	'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.oasis.opendocument.text',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/x-7z-compressed'
];
const imagearray = ['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/vnd.microsoft.icon', 'image/tiff', 'image/svg+xml'];
router.post('/setprofile', helper.authenticateToken, multerFn.memoryUpload.single("file"), async (req, res) => {
    if(req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)){
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let userdata = await primary.model(constants.MODELS.users, usersModel).findById(req.token.userid).lean();
        if(userdata){
            if (req.file) {
                if (imagearray.includes(req.file.mimetype)) {
                    let filesizeinMb = parseFloat(parseFloat(req.file.size) / 1000000);
                    if (filesizeinMb <= 5) {
						AwsCloud.saveToS3(req.file.buffer, userdata._id.toString(), req.file.mimetype, 'profile').then((result) => {
							var obj = {
								path: result.data
							}
							return responseManager.onSuccess('file added successfully...', obj, res);
						}).catch((err) => {
							return responseManager.onError(err, res);
						});
					} else {
                        return responseManager.badrequest({message : 'Images files must be less than 5 mb to upload, please try again'}, res);
					}
                }else{
                    return responseManager.badrequest({message : 'Invalid image file formate for profile, please try again'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Invalid image file please upload valid file, and try again'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid user to upload profile, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid user to upload profile, please try again'}, res);
    }
});
module.exports = router;
