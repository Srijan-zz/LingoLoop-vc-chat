const express= require('express')
const { protectRoute } = require('../middleware/authMiddleware')
const {getStreamToken} = require('../controllers/chatController')
const router=express.Router()


//middleware?

router.get('/token',protectRoute,getStreamToken)


module.exports = router