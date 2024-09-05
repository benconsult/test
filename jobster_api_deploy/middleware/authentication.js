
const user = require('../models/User')
const jwt =  require('jsonwebtoken')
const {Unauthenticated} = require('../errors')

const auth = async (req,res,next) => {
//check header
const authHeader = req.headers.authorization
if(!authHeader || !authHeader.startsWith('Bearer ')){
   throw new Unauthenticated('Authentication Invalid')
}
const token = authHeader.split(' ')[1]

try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    //test user read-only
    const testUser = payload.userId === '663216c3106588532f2add40';
    //attach the user to the job routes
    req.user = { userId: payload.userID, testUser}
    next();
} catch (error) {
    throw new Unauthenticated('Authentication Invalid')
}
}

module.exports = auth