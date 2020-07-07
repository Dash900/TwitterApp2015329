'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UserSchema = Schema({
    username: String,
    password: String,
    seguimientos: Number,
    seguidores: Number,
    tweets: Number
})

module.exports = mongoose.model("user", UserSchema);
