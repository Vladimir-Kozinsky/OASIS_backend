const Router = require('express')
const Aircraft = require("../models/aircrafts")
const cors = require('cors')
const req = require('express/lib/request')

const legsRouter = new Router()


const recalculate_FH = async (initLegs, initFH, initFC) => {
    let legs = initLegs
    const time_to_mm = (time) => {
        if (time) {
            const arr = time.split(':')
            const mm = (+arr[0] * 60) + (+arr[1])
            return mm
        } else {
            return console.log('time did not find')
        }
    }
    const mm_to_time = (mm) => {
        const HH = Math.floor(mm / 60)
        const MM = mm % 60
        return `${HH}:${MM}`
    }

    const calculateLegsFH = (legPos, legs, initFH) => { // подсчет с инитиал до legPos
        let newLegs = legs
        let total_mm = time_to_mm(initFH)
        for (let pos = 0; pos <= legPos; pos++) {
            const leg = newLegs[pos];
            total_mm += time_to_mm(leg.flightTime) // init + текущий лег
        }
        return total_mm
    }

    const calculateLegsFC = (legPos, legs, initFC) => {
        let total_fc = +initFC
        for (let pos = 0; pos <= legPos; pos++) {
            const leg = legs[pos];
            total_fc += 1
        }
        return total_fc
    }

    for (let pos = 0; pos < legs.length; pos++) {
        const leg = legs[pos];
        leg.fh = mm_to_time(calculateLegsFH(pos, legs, initFH))
        leg.fc = calculateLegsFC(pos, legs, initFC)
    }
    return legs
}


legsRouter.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))

legsRouter.get('/aircrafts/aircraft/legs/last', async (req, res) => {
    try {
        const { msn } = req.query
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();

        const legs = aircraft.legs.slice(aircraft.legs.length >= 10 ? aircraft.legs.length - 10 : 0, aircraft.legs.length)

        res.json(legs)
    } catch (error) {
        res.status(500).json(error)
    }
})

legsRouter.get('/aircrafts/aircraft/legs', async (req, res) => {
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

legsRouter.post('/aircrafts/legs/add', async (req, res) => {
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

legsRouter.post('/aircrafts/legs/del', async (req, res) => {
    try {
        const { msn, legId } = req.body
        const aircraft = await Aircraft.findOne({ msn: msn }).exec();
        let legs = aircraft.legs
        let legIndex = legs.findIndex((leg) => leg.id === legId)
        legs.splice(legIndex, 1)
        const updatedLegs = await recalculate_FH(legs, aircraft.initFH, aircraft.initFC)
        const updatedFH = updatedLegs[updatedLegs.length - 1].fh
        const updatedFC = updatedLegs[updatedLegs.length - 1].fc
        await Aircraft.updateOne(
            { msn: msn },
            {
                legs: updatedLegs,
                FH: updatedFH,
                FC: updatedFC
            }, { upsert: true });
        res.json(aircraft)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = legsRouter