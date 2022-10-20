var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let async = require('async');
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const usersModel = require('../../models/users.model');
const constants = require('../../utilities/constants');
const timecalculation = require('../../utilities/timecalculations');
router.get('/', async (req, res) => {
    if (req.session.userid && req.session.userid != null && req.session.userid != '') {
        res.render('chats/chat', { title: "Chats" });
    } else {
        if (req.session.contact_no && req.session.contact_no != null && req.session.contact_no != '') {
            var goto = process.env.APPURI + '/otp';
            res.writeHead(302, { 'Location': goto });
            res.end();
        } else {
            var goto = process.env.APPURI + '/login';
            res.writeHead(302, { 'Location': goto });
            res.end();
        }
    }
});
module.exports = router;