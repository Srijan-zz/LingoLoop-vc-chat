const express = require('express')
const router = express.Router()


//import controllers
const {getRecommendedUsers,sendFriendRequest, getFriends, acceptFriendRequest, getFriendRequests, getOutgoingFriendReqs} = require('../controllers/userController')

//middleware
const {protectRoute}=require('../middleware/authMiddleware')
router.use(protectRoute)//sab use krre isliywe general declaration

router.get('/',getRecommendedUsers )
router.get('/friends', getFriends)


router.post('/friend-request/:id', sendFriendRequest)
router.put('/friend-request/:id/accept', acceptFriendRequest)


router.get('/friend-request',getFriendRequests);
router.get('/outgoing-friend-requests',getOutgoingFriendReqs);

module.exports=router