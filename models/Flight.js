const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    flightNumber:{
        type:Number,
        trim:true,
        required:true,
    },
    departureDateTime:{
        type:Date,
        required:true,
    },
    seatsAvailable:{
        type:Number,
        required:true,
        default:60
    },
    origin:{
        type:String,
        required:true,
    },
    destination:{
        type:String,
        required:true,
    },
    passangers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]

})

module.exports = mongoose.model("Flight", FlightSchema);