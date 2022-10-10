let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const productModel = require('../../../models/products.model');
const businessModel = require('../../../models/business.model');
const helper = require('../../../utilities/helper');
const constants = require('../../../utilities/constants');
let mongoose = require('mongoose');
router.post('/create', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let productData = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
        if (businessdata) {
            productData.price = parseFloat(productData.price);
            productData.userid = mongoose.Types.ObjectId(req.token.userid);
            productData.businessid = mongoose.Types.ObjectId(businessdata._id);
            await primary.model(constants.MODELS.products, productModel).create(productData);
            return responseManager.onSuccess('Product created successfully!', 1, res);
        } else {
            return responseManager.unauthorisedRequest(res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to create product, please try again' }, res);
    }
});
router.post('/edit', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        let productData = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
        if (businessdata) {
            productData.price = parseFloat(productData.price);
            let pid = productData.productid;
            delete productData.productid;
            await primary.model(constants.MODELS.products, productModel).findByIdAndUpdate(pid, productData).lean();
            return responseManager.onSuccess('Product updated successfully!', 1, res);
        } else {
            return responseManager.unauthorisedRequest(res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to edit product, please try again' }, res);
    }
});
router.post('/list', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        const { page, limit, search, sortfield, sortoption } = req.body;
        let primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
        if (businessdata) {
            primary.model(constants.MODELS.products, productModel).paginate({
                $or: [
                    { name: { '$regex': new RegExp(search, "i") } },
                    { description: { '$regex': new RegExp(search, "i") } },
                    { category: { '$regex': new RegExp(search, "i") } },
                    { subCategory: { '$regex': new RegExp(search, "i") } },
                    { offer: { '$regex': new RegExp(search, "i") } },
                    { itemCode: { '$regex': new RegExp(search, "i") } },
                ],
                userid: mongoose.Types.ObjectId(req.token.userid),
            }, {
                page,
                limit: parseInt(limit),
                sort: { [sortfield]: [sortoption] },
                lean: true
            }).then((products) => {
                return responseManager.onSuccess('Products list!', products, res);
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        } else {
            return responseManager.unauthorisedRequest(res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get product list, please try again' }, res);
    }
});
router.get('/single', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        if (req.query.pid && mongoose.Types.ObjectId.isValid(req.query.pid)){
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
            if (businessdata) { 
                let productData = await primary.model(constants.MODELS.products, productModel).findById(req.query.pid).lean();
                return responseManager.onSuccess('Products data!', productData, res);
            } else {
                return responseManager.unauthorisedRequest(res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid product id to get product, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get product, please try again' }, res);
    }
});
router.delete('/remove', helper.authenticateToken, async (req, res) => {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
        if (req.body.pid && mongoose.Types.ObjectId.isValid(req.body.pid)){
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let businessdata = await primary.model(constants.MODELS.business, businessModel).findOne({ userid: mongoose.Types.ObjectId(req.token.userid) }).lean();
            if (businessdata) { 
                await primary.model(constants.MODELS.products, productModel).findByIdAndRemove(req.body.pid);
                return responseManager.onSuccess('Product deleted successfully!', 1, res);
            } else {
                return responseManager.unauthorisedRequest(res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid product id to delete product, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to delete product, please try again' }, res);
    }
});
module.exports = router;