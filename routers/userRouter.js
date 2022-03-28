const Router = require('express')
const User = require("../models/users")
const cors = require('cors')
const req = require('express/lib/request')

const router = new Router()

router.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))

// ADD USER

router.post('/user', async (req, res) => {
    try {
        const { name, password, isRemember } = req.body
        const userId = name
        const user = await User.create({ userId, name, password, isRemember })
        res.json(user)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.post('/user/auth', async (req, res) => {
    try {
        const { name, password, isRemember } = req.body
        const user = await User.findOne({ name: name }).exec();
        if (user && user.password === password) {
            res.json({
                resultCode: 1,
                message: "User successfully logged",
                user: user
            })
        } else {
            res.json({
                resultCode: 2,
                message: "Login or password are wrong",
            })
        }
    } catch (error) {
        res.status(500).json(error)
    }
})





module.exports = router