const express = require('express')
const router = express.Router()
const parkingController = require("../controller/parkingController")

router.post('/create',  parkingController.createParkingLot)

router.get('/:lotId/allocatedAndAvailableSlotCount',  parkingController.allocatedAndAvailableSlotCount)

router.get('/:lotId/vehicleCountByColour',  parkingController.vehicleCountByColour)

router.get('/:lotId/status',  parkingController.parkingLotStatus)

router.get('/:lotId/vehicles/:vehicleNumber/vehiclePosition',  parkingController.vehiclePosition)

router.post('/:lotId/vehicles/:vehicleNumber/park',  parkingController.parkVehicle)

router.post('/:lotId/vehicles/:vehicleNumber/reserve',  parkingController.reserveParkingSlot)

router.post('/:lotId/vehicles/:vehicleNumber/unPark',  parkingController.unParkVehicle)

router.delete('/:lotId/delete',  parkingController.deleteParkingLot)

module.exports = router