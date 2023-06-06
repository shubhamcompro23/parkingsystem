const express = require("express")
const dotenv = require('dotenv').config()
const app = express()
const userRoutes = require("./routes/userRoutes")
const parkingLotRoutes = require("./routes/parkingRoutes")


const port = process.env.port

// Body parser, reading data from body into req.body
app.use(express.json())

//Routes
app.use('/', userRoutes)
app.use('/parkingLots', parkingLotRoutes)


app.use((req,res,next)=>{
    res.send({
        status: 404,
        message: "Not Found"
    })
})

app.listen(port,()=>{
    console.log(`your app is running on port ${port}...!`)
})
