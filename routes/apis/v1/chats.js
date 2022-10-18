let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const chatModel = require('../../../models/chats.model');
const userModel = require('../../../models/users.model');
const productModel = require('../../../models/products.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
const multerFn = require('../../../utilities/multer.functions');
const AwsCloud = require('../../../utilities/aws');
const socketBox = require('../../../utilities/socket');
let mongoose = require('mongoose');
router.post('/', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        const { to, page, limit } = req.body;
        primary.model(constants.MODELS.chats, chatModel).paginate({
            $or: [
                { $and: [{ from: mongoose.Types.ObjectId(req.token.userid) }, { to: mongoose.Types.ObjectId(to) }] },
                { $and: [{ to: mongoose.Types.ObjectId(req.token.userid) }, { from: mongoose.Types.ObjectId(to) }] }
            ],
        }, {
            page,
            limit: parseInt(limit),
            populate: [
                { path: 'from', model: primary.model(constants.MODELS.users, userModel), select: "profileimage fullName emailId contact_no" },
                { path: 'to', model: primary.model(constants.MODELS.users, userModel),  select: "profileimage fullName emailId contact_no" },
                { path: 'content.product.productid', model: primary.model(constants.MODELS.products, productModel), select: "name price description category subCategory offer itemCode images" },
                { path: 'context', model: primary.model(constants.MODELS.chats, chatModel)},
            ],
            sort: { timestamp: -1 },
            lean: true
        }).then((chatlist) => {
            return responseManager.onSuccess('chat list', chatlist, res);
        }).catch((error) => {
            return responseManager.onError(error, res);
        });
    }else{
        return responseManager.badrequest({ message: 'Invalid token to receive messages, please try again' }, res);
    }
});
router.post('/send', helper.authenticateToken, multerFn.memoryUpload.single("file"), async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        const { to, message, product, context } = req.body;
        if(to && to != null && to != undefined && mongoose.Types.ObjectId.isValid(to)){
            let messageData = {
                from : mongoose.Types.ObjectId(req.token.userid),
                to : mongoose.Types.ObjectId(to),
                context : (context && context != '' && mongoose.Types.ObjectId.isValid(context)) ? mongoose.Types.ObjectId(context) : null,
                contentType : '',
                content : {
                    text : {},
                    media : {},
                    product : {}
                },
                timestamp : Date.now(),
                status : 'sent' 
            };
            if(req.file){
                let uploadResult = await AwsCloud.saveToS3(req.file.buffer, req.token.userid.toString(), req.file.mimetype, 'chat');
                if(uploadResult){
                    messageData.content.media.path = uploadResult.data.Key;
                    messageData.content.media.type = helper.getFileType(req.file.mimetype);
                    messageData.content.media.mime = req.file.mimetype;
                    let f1 = uploadResult.data.Key.split("/");
                    messageData.content.media.name = f1[f1.length - 1];
                }
                if(message && message != null && message.trim() != ''){
                    messageData.content.text.message = message;
                    messageData.contentType = 'mediawithtext';
                }else{
                    messageData.contentType = 'media';
                }
            }else if(product && product != null && product != undefined && mongoose.Types.ObjectId.isValid(product)){
                messageData.content.product.productid = mongoose.Types.ObjectId(product);
                messageData.contentType = 'product';
            }else if(message && message != null && message.trim() != ''){
                messageData.content.text.message = message;
                messageData.contentType = 'text';
            }
            let response = await primary.model(constants.MODELS.chats, chatModel).create(messageData);
            return responseManager.onSuccess('message sent successfully...', response, res);
        }else{
            return responseManager.badrequest({ message: 'Invalid recipient id to send message, please try again' }, res);
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to send message, please try again' }, res);
    }
});

module.exports = router;