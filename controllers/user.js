const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Flight = require('../models/Flight');
const user = require('../models/user');
require('cookie-parser')
const cookie = require('cookie')
require("dotenv").config();
// signup 

exports.signup = async (req,res)=>{
    try {
        const {userName,password,email} = req.body;

    // validation

    if(!userName || !password || !email){
        return res.status(500).json({
            success:false,
            message:"Missing fields / all fields are required"
        })
    }

    // check already exist
    const fetcheduser = await user.findOne({email});

    if(fetcheduser){
        return res.status(500).json({
            success:false,
            message:'User Aready Exists'
        })
    }


    // hash the password 
    const hashedPassword = await bcrypt.hash(password, 10);


    // create user 
    const userins = await user.create({
       userName,
       password:hashedPassword,
       email
      });


    return res.status(200).json({
        success:true,
        message:"User registered successfully"
    })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Some error occured in registration please try again"
        })
        
    }

}

// login

exports.login = async (req,res)=>{
    try {
        const {email,password} = req.body;

    // validate

    if(!email || !password){
        return res.status(500).json({
            success:false,
            message:'All fields are required',
        })
    }

    // check user exist or not;

    const userexists = await user.findOne({email});

    if(!userexists){
        return res.status(500).json({
            success:false,
            message:'user not registered'
        })
    }

    // otherwise match the password

    if(await bcrypt.compare(password,userexists.password)){
        const token = jwt.sign({id:userexists._id,userName:userexists.userName,Role:userexists.Role},
            process.env.SECRET_KEY,
            {expiresIn:'24h'});

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
              }
              return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                userexists,
                message: `User Login Success`,
              })
    }
    else{
        return res.status(401).json({
            success: false,
            message: `Password is incorrect`,
          })
    }
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
          })
    }
}

// find flights by date and time

exports.findByDateandTime = async (req, res) => {
    try {
        const { date, time } = req.query;

    // Convert date and time strings to Date objects
    const searchDateTime = new Date(date + 'T' + time +'Z');

    // Filter flights based on the search date and time
    const matchingFlights = await Flight.find({departureDateTime: searchDateTime})
    

    return res.status(200).json({success:true,matchingFlights});
    } 
    catch (error) {
        console.error('Error finding flights:', error);
        res.status(500).json({success:false,
            message: 'Internal server error' });
    }
}


// Book flight

exports.Book = async(req,res)=>{
    const {flightId } = req.body;
   
    
    const userId = req.user.id;
   
    
    try {
        const userfetched = await user.findById(userId);
        if (!userfetched) {
            return res.status(404).json({ success:false,message: 'User not found' });
        }

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({success:false, message: 'Flight not found' });
        }

        if (flight.seatsAvailable <= 0) {
            return res.status(400).json({ success:false,message: 'No available seats on the flight' });
        }

        if(flight.passangers.includes(userId)){
            return res.status(400).json({ success:false,message: 'You have already booked' });
        }
        

        // book the ticket for the user
        userfetched.Bookings.push(flightId);
        await userfetched.save();

        // add passanger to flight
        
        flight.seatsAvailable--;
        flight.passangers.push(userId);
        await flight.save();


        return res.status(200).json({success:true, message: 'Ticket booked successfully' });
    } catch (error) {
        console.error('Error booking ticket:', error);
        res.status(500).json({ success:false,message: 'Internal server error' });

    }
}

// list Bookings
exports.listBookings = async (req,res)=>{
    const userId = req.user.id;

    try {
        const fetcheduser = await user.findById(userId).populate('Bookings');

        if(!fetcheduser){
            return res.status(404).json({ success:false,message: 'User not found' });
        }

        return res.status(200).json({ user, bookings: fetcheduser.Bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({success:false, message: 'Internal server error' });
    }
}


// log out
exports.logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}