
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')


const {BadRequestError, UnauthenticatedError } = require('../errors')

const register = async (req, res) =>{
    
    const user = await User.create({...req.body})
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({ user: {email: user.email, lastName: user.lastName,location: user.location, name: user.name,token, }})
    
}

const login = async (req, res) =>{
    const { email,password } =  req.body
    if(!email || !password){
        throw new BadRequestError('Please provide email and password')
    }
const user = await User.findOne({ email })

if(!user){
    throw new UnauthenticatedError('Invalid Credentials')
}
//only if there's a user
const isPasswordCorrect = await user.comparePassword(password)
if(!isPasswordCorrect){
    throw new UnauthenticatedError('Invalid credentials')
}

const token = user.createJWT()

    res.status(StatusCodes.OK).json({ user: {email: user.email, lastName: user.lastName,location: user.location, name: user.name,token, }})
    

}

//update user profile
const updateUser = async (req, res) =>{
    //check what's being sent
    // console.log(req.user);//from jwt
    // console.log(req.body);
    const {email,name,lastName,location} = req.body;
    console.log(req.user); //test for read-only
    if(!email || !name || !location || !lastName){
        
        throw new BadRequest('Please provide all values')
    }
    //get user from db
    const user = await User.findOne({_id: req.user.userId });
    //change the value to update
    user.email = email;
    user.name = name;
    user.location = location;
    user.lastName = lastName;
 

    await user.save();

    const token = user.createJWT()

    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            location: user.location,
            token,
        },
    });
    
};
module.exports = { register,login,updateUser, }