const mongoose = require('mongoose')

const user = new mongoose.Schema({
    id:{
        type: String,
        required: true
    },
    Firstname: {
        type: String,
        required: true,
    },
    Lastname: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Password: {
        type: String,
        required: true,
    },
    Token: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('userinfo',user)