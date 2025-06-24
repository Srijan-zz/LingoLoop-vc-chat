const jwt = require("jsonwebtoken")
const User = require('../models/User')



exports.protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        //token hai ki ni
        if (!token) {
            return res.status(401).json(
                { message: "Unauthorized - no token" }
            )
        }


        //hai to fir sahi hai ki ni
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        if (!decode) {
            return res.status(401).json(
                { message: "Unauthorized - invalid token" }
            )
        }
        //sahi hai token
        const user = await User.findById(decode.userId).select('-password')

        //user hi ni hai aisa
        if (!user) {
            return res.status(401).json(
                { message: "Unauthorized - user not found" }
            )
        }

        req.user=user;
// console.log(user._id);

        next();

    } catch (error) {

    }
}