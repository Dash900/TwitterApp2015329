'use strict'

var express = require('express');
var api = express.Router();
var tweetController = require('../controllers/tweetController');
var md_auth = require('../middlewares/authenticated');


api.post('/commands', md_auth.ensureAuth, tweetController.commands);

module.exports = api;
