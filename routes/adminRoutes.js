const express = require("express")
const router = express.Router()
const {Verify,isAdmin} = require('../middleware/auth');

const {login,addFlight,removeFlight,findByFnumberandTime,logout}= require('../controllers/admin');



router.post("/login",login);
router.post("/addFlight",Verify,isAdmin,addFlight);
router.delete("/removeFlight",Verify,isAdmin,removeFlight);
router.get("/findByFnumberandTime",Verify,isAdmin,findByFnumberandTime);
router.post("/logout",logout);

module.exports = router;