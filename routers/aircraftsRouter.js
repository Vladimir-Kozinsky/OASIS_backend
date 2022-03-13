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

router.get('/aircrafts/aircraft/legs/last', async (req, res) => {
    try {
        const { msn } = req.query
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();

        const legs = aircraft.legs.slice(aircraft.legs.length >= 10 ? aircraft.legs.length - 10 : 0, aircraft.legs.length)

        res.json(legs)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/aircrafts/aircraft/legs', async (req, res) => {
    try {
        const { msn, from = '2022-03-02', to = '2022-03-05', selectedPage } = req.query
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();

        if (!from || !to) {
            const legs = aircraft.legs.slice(0, 11)
            const totalPages = (legs.length % 10) !== 0
                ? Math.floor(legs.length / 10) + 1
                : Math.floor(legs.length / 10)

            res.json({
                legs: legs,
                totalPages: totalPages
            })
            console.log("!from and !to")

        } else if (!selectedPage) {
            const legs = aircraft.legs.filter(function (leg) {
                const startDate = new Date(from).getTime()
                const endDate = new Date(to).getTime()
                const depDate = new Date(leg.depDate).getTime()
                return (depDate <= endDate) && (depDate >= startDate)
            });

            const totalPages = (legs.length % 10) !== 0
                ? Math.floor(legs.length / 10) + 1
                : Math.floor(legs.length / 10)

            const legsPortion = legs.slice(0, 10)

            res.json({
                legs: legsPortion,
                totalPages: totalPages,
                selectedPage: 1

            })
            console.log("!selectedPage")
        } else {
            const legs = aircraft.legs.filter(function (leg) {
                const startDate = new Date(from).getTime()
                const endDate = new Date(to).getTime()
                const depDate = new Date(leg.depDate).getTime()
                return (depDate <= endDate) && (depDate >= startDate)
            });

            const startLeg = (selectedPage - 1) * 10
            const endLeg = startLeg + 10
            const legsPortion = legs.slice(startLeg, endLeg)

            const totalPages = (legs.length % 10) !== 0
                ? Math.floor(legs.length / 10) + 1
                : Math.floor(legs.length / 10)

            res.json({
                legs: legsPortion,
                totalPages: totalPages,
                selectedPage: selectedPage
            })
            console.log('allll')
        }

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
        await Aircraft.updateOne(
            { msn: msn },
            {
                FH: leg.fh,
                FC: leg.fc
            },
        );
        const aircraftUpdateLegs = await Aircraft.findOne({ msn: msn }).exec();
        const legs = aircraftUpdateLegs.legs.slice(aircraft.legs.length >= 10 ? aircraft.legs.length - 9 : 0, aircraft.legs.length + 1)
        res.json({
            resultCode: 1,
            message: "Leg succesfully added",
            legs: legs
        })
    } catch (error) {
        res.status(500).json(error)
    }
})
// DELETE LEG

router.post('/aircrafts/legs/del', async (req, res) => {
    try {
        const { msn, legId } = req.body
        //const aircraft = await Aircraft.create({ msn, FH, FC, legs })
        console.log(msn, legId)
        //res.json(aircraft)
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