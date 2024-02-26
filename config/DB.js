const mongoose= require("mongoose");
require("dotenv").config();

console.log('running DB.js');


   mongoose.connect(process.env.MONGODB_URL,{
   })  
   .then(()=> console.log("DB connected successfully"))
   .catch((error)=>{
    console.log("Failed connection");
    console.error(error);
    process.exit(1);

    
   })
