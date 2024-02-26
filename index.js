const express=require('express')
const cookieParser = require('cookie-parser');

const  userRoutes = require('./routes/userRoutes')
const  adminRoutes = require('./routes/adminRoutes')


// const val = require('./jsondata')

require('./config/DB')

const app=express();

const Port=3000;

// const feedData = async ()=>{
//     const res = await Data.insertMany(val);
//     console.log(res);
    
// }

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>'); // Sending "Hello" as the response
});

app.listen(Port,()=>console.log(`server started at ${Port}`))