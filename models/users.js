const { default: mongoose } = require('mongoose');

const userSchema = new mongoose.Schema({
    msn: { type: Number, required: true },
    FH: { type: String, required: true },
    FC: { type: String, required: true },
    initFH: { type: String, required: true },
    initFC: { type: String, required: true },
    
})

const User = mongoose.model('User', userSchema)

module.exports = User