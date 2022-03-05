const aircraftSchema = new Schema({
    aircraft: {
        msn: { type: Number, required: true },
        FH: { type: String, required: true },
        FC: { type: String, required: true },
        legs: [
            {}
        ]
    }
})