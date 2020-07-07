'user strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowingSchema = Schema({
    username: String,
    seguimientos: [{
        username: String
    }]
})

module.exports = mongoose.model('following', FollowingSchema);