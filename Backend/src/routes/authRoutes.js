const express =require('express')

const router = express.Router()
const {signup, login,logout,onboard} = require('../controllers/authController')
const {protectRoute} = require('../middleware/authMiddleware')

router.post('/signup', signup)

router.post('/login', login)
router.post('/logout', logout)// logout posts no data then why a post request??? 
//post request are for routes/request that change the server state, logout indeed does that by destorying a session on server side, hence a post request


router.post('/onboarding',protectRoute,onboard)



//check if authenticated or not
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports=router




