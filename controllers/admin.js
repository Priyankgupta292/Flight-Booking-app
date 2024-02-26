const user = require('../models/user')
const Flight = require('../models/Flight')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('cookie-parser')
const cookie = require('cookie')

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //client side validation

        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: 'Fill all requied fields'
            })
        }

        // find user
        const userexists = await user.findOne({ email });

        // user not exists -> return
        if (!userexists) {
            return res.status(401).json({
                success: false,
                message: 'User does not exists'
            })
        }

        // user exists but role is not Admin then return
        if (userexists.Role !== "Admin") {
            return res.status(500).json({
                success: false,
                message: 'This is Protected route for Admin only'
            })
        }

        // match password

        if (await bcrypt.compare(password, userexists.password)) {
            const token = jwt.sign({
                id: userexists._id,
                userName: userexists.userName,
                Role: userexists.Role
            },
                process.env.SECRET_KEY,
                { expiresIn: '24h' });

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                userexists,
                message: 'Admin login success'
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            })
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: `Admin Login Failure Please Try Again`,
        })
    }

}

exports.addFlight = async (req, res) => {
    const { flightNumber, date, time, origin, destination } = req.body;
    const departureDateTime = new Date(date + 'T' + time + 'Z');
    try {
        // validation
        if (!flightNumber || !date ||!time || !origin || !destination) {
            return res.status(501).json({
                success: false,
                message: "Fill all the required fields"
            })
        }

        // check for same flight number

        let flightexists = await Flight.findOne({ flightNumber,departureDateTime});
        // console.log(flightexists.departureDateTime,departureDateTime);
        
        if (flightexists) {
            return res.status(401).json({
                success: false,
                message: "flight with same flight number is scheduled for this time"
            })
        }

        // flightexists = await  Flight.findOne({ flightNumber});

        // create instance in DB
        const Flightins = await Flight.create({
            flightNumber,
            departureDateTime,
            origin,
            destination
        });

        // return response
        return res.status(200).json({
            success: true,
            message: "Flight Added Successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Some error occured adding flight please try again"
        })
    }
}

exports.removeFlight = async (req, res) => {
    const { flightId } = req.body;

    try {
        // validate
        if (!flightId) return res.status(401).json({
            success: false,
            message: 'Please provide flightid'
        })

        // check flight exists 
        const flightexists = await Flight.findById(flightId)

        if (!flightexists) {
            return res.status(401).json({
                success: false,
                message: 'No such flight exists'
            })
        }

        if (flightexists.passangers.length !== 0) {
            return res.status(501).json({
                success: false,
                message: 'Passangers are already booked in this flight so it can not be deleted'
            })
        }

        const deletedflight = await Flight.findByIdAndDelete(flightId);

        return res.status(200).json({
            success: true,
            deletedflight,
            message: 'Flight deleted successully'
        })


    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error please try again'
        });
    }
}

exports.findByFnumberandTime = async (req, res) => {
    const { flightNumber, date, time } = req.query;

    try {
        // CONVERT date time in mongo date object
        const searchDateTime = new Date(date + 'T' + time + 'Z');
        let matchingFlights
        if(flightNumber)
        {
            matchingFlights = await Flight.find({ departureDateTime: searchDateTime, flightNumber: flightNumber }).populate('passangers');
        }
        else{
            matchingFlights = await Flight.find({ departureDateTime: searchDateTime}).populate('passangers');
        }
        

        if (!matchingFlights) {
            return res.status(401).json({
                success: false,
                message: 'No such flight available'
            })
        }

        return res.status(200).json({
            success: true,
            matchingFlights,
        })




    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server error please try again'
        })

    }
}

exports.logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}