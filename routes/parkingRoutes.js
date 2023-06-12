const express = require('express')
const router = express.Router()
const parkingController = require("../controller/parkingController")
const customer = require("../middleware/customer")
const admin = require("../middleware/admin")

router.post('/create', admin, parkingController.createParkingLot)

router.get('/:lotId/allocatedAndAvailableSlotCount', admin, parkingController.allocatedAndAvailableSlotCount)

router.get('/:lotId/vehicleCountByColour',admin,  parkingController.vehicleCountByColour)

router.get('/:lotId/status',admin,  parkingController.parkingLotStatus)

router.get('/:lotId/vehicles/:vehicleNumber/vehiclePosition',customer,  parkingController.vehiclePosition)

router.post('/:lotId/vehicles/:vehicleNumber/park',customer,  parkingController.parkVehicle)

router.post('/:lotId/vehicles/:vehicleNumber/reserve',customer,  parkingController.reserveParkingSlot)

router.post('/:lotId/vehicles/:vehicleNumber/unPark',customer,  parkingController.unParkVehicle)

router.delete('/:lotId/delete',admin,  parkingController.deleteParkingLot)

module.exports = router