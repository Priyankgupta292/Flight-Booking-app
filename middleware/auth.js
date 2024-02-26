const jwt = require('jsonwebtoken')
const user = require('../models/user')
require("dotenv").config();

// verify user


exports.Verify= async (req,res,next)=>{
    
    try {
        // get token
        const token =req.cookies.token;

        if(!token){
            return res.status(401).json({
                success:false,
                message:'token missing please login'
            })
        }

        try {
            const decode = await jwt.verify(token,process.env.SECRET_KEY)

            req.user = decode;
            // console.log(decode);

        } catch (error) {
            console.log(error);
            
            return res.status(401).json({
                success:false,
                message:'token is invalid'
            })
        }
        
        
        next();
    } catch (error) {
        console.log(error);
        
        return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
    }
  
}


exports.isAdmin = async (req,res,next)=>{
    try {
        // fetch user
        // console.log(req.user);
        
        const userDetails = await user.findById(req.user.id);
        // console.log(userDetails);
        
        if(!userDetails){
            return res.status(401).json({
				success: false,
				message: "User not exists",
			});
        }

        if(userDetails.Role !== "Admin"){
            return res.status(401).json({
				success: false,
				message: "This is protected route for admin",
			});
        }
        next();

    } catch (error) {
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
    }
}

exports.isUser = async (req,res,next)=>{
    try {
        // fetch user
        const userDetails = await user.findById(req.user.id);

        if(!userDetails){
            return res.status(401).json({
				success: false,
				message: "User not exists",
			});
        }

        if(userDetails.Role !== "User"){
            return res.status(401).json({
				success: false,
				message: "This is protected route for User",
			});
        }
        next();

    } catch (error) {
        return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
    }
}