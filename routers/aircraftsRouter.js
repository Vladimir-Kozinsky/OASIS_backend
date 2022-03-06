const Router = require('express')
const Aircraft = require("../models/aircrafts")
const cors = require('cors')
const req = require('express/lib/request')

const router = new Router()

router.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))

router.get('/aircrafts', async (req, res) => {
    try {
        const aircrafts = await Aircraft.find().exec();
        let aircraftsArr = [];
        aircrafts.forEach(element => {
            aircraftsArr.push(element.msn)
        });
        res.json(aircraftsArr)
    } catch (error) {
        res.status(500).json(error)
    }
})
router.get('/aircrafts/aircraft/data', async (req, res) => {
    try {
        const { msn } = req.query
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();
        res.json({
            msn: aircraft.msn,
            FH: aircraft.FH,
            FC: aircraft.FC,
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/aircrafts/aircraft/legs', async (req, res) => {
    try {
        const { msn } = req.query
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();
        res.json(aircraft.legs)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.post('/aircrafts/legs/add', async (req, res) => {
    try {
        const { msn, leg } = req.body
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();
        await Aircraft.updateOne(
            aircraft,
            { $push: { legs: leg } },
        );
        const aircraftUpdateLegs = await Aircraft.findOne({ msn: msn }).exec();
        res.json({
            resultCode: 1,
            message: "Leg succesfully added",
            legs: aircraftUpdateLegs.legs
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

// ADD AIRCRAFT
router.post('/aircrafts/add', async (req, res) => {
    try {
        const { msn, FH, FC, legs } = req.body
        //const aircraft = await Aircraft.create({ msn, FH, FC, legs })

        //res.json(aircraft)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router