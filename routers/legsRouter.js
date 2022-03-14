const Router = require('express')
const Aircraft = require("../models/aircrafts")
const cors = require('cors')
const req = require('express/lib/request')

const legsRouter = new Router()


const recalculate_FC = async (msn) => {
    const time_to_mm = (time) => {
        const arr = time.split(':')
        const mm = (+arr[0] * 60) + (+arr[1])
        return mm
    }

    const calculateLegsFH = (legPos, legs, initFH) => { // прлсчет с инитиал до legPos

        for (let pos = 0; pos < legPos; pos++) {
            const leg = legs[pos];
            let total_mm = time_to_mm(initFH) + time_to_mm(leg.flightTime)
            for (let i = 0; i < pos; i++) {
                total_mm += time_to_mm(legs[i].flightTime)
            }
            leg.fh = total_mm
        }
        console.log(legs)
    }

    // calculateLegsFH(5, [
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    //     { flightTime: '10:05' },
    // ], '10:10')

    const aircraft = await Aircraft.findOne({ msn: msn }).exec();
    let legs = aircraft.legs
    for (let pos = 0; pos < legs.length; pos++) {
        const leg = legs[pos];
        leg.flightTime = calculateLegsFH(0, aircraft.legs, aircraft.initFH)
    }
    return legs
}

console.log(recalculate_FC(24985))


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

        await Aircraft.updateOne(
            { msn: msn },
            { legs: legs }, { upsert: true });


        //res.json(aircraft)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = legsRouter