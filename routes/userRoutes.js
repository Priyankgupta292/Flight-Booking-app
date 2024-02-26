const express = require("express")
const router = express.Router()
const {Verify,isUser} = require('../middleware/auth');

const {signup,login,findByDateandTime,Book,listBookings,logout}=require('../controllers/user');




router.post("/signup",signup);
router.post("/login",login);
router.get("/findByDateandTime",findByDateandTime);
router.post("/Book",Verify,isUser,Book);
router.get("/listBookings",Verify,isUser,listBookings);
router.post("/logout",logout);

module.exports = router;