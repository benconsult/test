

const express = require('express')
const router = express.Router()
const authenticatedUser = require('../middleware/authentication')
const testUser = require('../middleware/testUser')

const rateLimiter = require('express-rate-limit')

const apiLimiter = rateLimiter({
    windowMs: 15 *60 *1000,
    max: 10,
    message: {
        msg: 'You have exceeded the number of login, please try again in 10  minutes'
    }

})
//import controller methods
const {register,login, updateUser} = require('../controllers/auth')

//method 2
router.post('/register',apiLimiter,register)
router.post('/login',apiLimiter,login)
router.patch('/updateUser',authenticatedUser,testUser,updateUser)

module.exports = router