const express = require('express')
const cookieParser = require('cookie-parser')
const cors =require('cors')
const path = require('path')
//make app
const app = express();


app.use(cors({
    origin:"http://localhost:5173",
    credentials:true, //allow frontent to send cookies
}))
//middle ware
app.use(express.json())
app.use(cookieParser())
//dotenv
require('dotenv').config();
PORT= process.env.PORT || 5001


const _dirname =path.resolve();

//use the routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')

//for deploymwent
if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(_dirname,"../Frontend/dist")))

    app.get("*",(req,res)=>{
        res.sendFile(path.join(_dirname,"../Frontend/dist/index.html"))
    })
}
//go one above current dir, go one above i.e. project folder then frontend then dist 
app.use('/api/auth', authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chat',chatRoutes)
//db function
const {connectDb}= require('./config/db')


//add krliya h
app.listen(PORT, ()=>{
    console.log("server is running on port:",PORT);
    connectDb();
})





// defaultroutes
app.get('/', (req,res)=>{
   res.send("Home route")
})