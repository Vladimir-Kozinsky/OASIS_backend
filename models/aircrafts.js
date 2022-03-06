const { default: mongoose } = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    msn: { type: Number, required: true },
    FH: { type: String, required: true },
    FC: { type: String, required: true },
    legs: [
        {
            depDate: { type: String, required: true },
            flightNumber: { type: String, required: true },
            from: { type: String, required: true },
            to: { type: String, required: true },
            blockOff: { type: String, required: true },
            takeOff: { type: String, required: true },
            landing: { type: String, required: true },
            blockOn: { type: String, required: true },
            flightTime: { type: String, required: true },
            blockTime: { type: String, required: true },
            fh: { type: String, required: true },
            fc: { type: String, required: true }
        }
    ]
})

const Aircraft = mongoose.model('Aircraft', aircraftSchema)

module.exports = Aircraft