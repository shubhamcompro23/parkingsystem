const express = require('express')
const router = express.Router()
const parkingController = require("../controller/parkingController")

router.post('/create',  parkingController.createParkingLot)

module.exports = router