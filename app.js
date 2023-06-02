const express = require("express")
const dotenv = require('dotenv').config()
const app = express()
const user = require("./models/user")


const port = process.env.port

user.createUserTable()



app.listen(port,()=>{
    console.log(`your app is running on port ${port}...!`)
})
