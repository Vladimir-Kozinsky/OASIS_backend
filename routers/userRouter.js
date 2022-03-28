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

router.post('/user/signup', async (req, res) => {
    try {
        const { login, firstName, lastName, position, password, isRemember } = req.body.userInfo
        const userId = firstName
        const isUser = await User.findOne({ login: login }).exec();
        if (!isUser) {
            const user = await User.create({ userId, login, firstName, lastName, position, password, isRemember })
            res.json({
                resultCode: 1,
                message: `User ${user.firstName} ${user.lastName} successfully created`,
            })
        } else {
            res.json({
                resultCode: 2,
                message: `User ${isUser.login} already exists`,
            }) 
        }



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
                userInfo: user
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