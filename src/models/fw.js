'user strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowerSchema = Schema({
    username: String,
    seguidores: [{
        username: String,
    }]
})

module.exports = mongoose.model('follower', FollowerSchema);