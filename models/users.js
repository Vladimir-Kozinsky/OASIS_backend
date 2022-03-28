const { default: mongoose } = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    login: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    position: { type: String, required: true },
    password: { type: String, required: true },
    isRemember: { type: Boolean, required: true },
})

const User = mongoose.model('User', userSchema)

module.exports = User