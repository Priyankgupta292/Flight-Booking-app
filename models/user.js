const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName:{
        type:String,
        trim:true,
        required:true,
    },
    Role:{
        type:String,
        default:"User"
    },
    password:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    Bookings:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Flight"
    }]

})

module.exports = mongoose.model("user", UserSchema);
