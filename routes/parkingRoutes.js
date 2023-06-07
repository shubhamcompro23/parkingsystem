const express = require('express')
const router = express.Router()
const parkingController = require("../controller/parkingController")

router.get('/:lotId/allocatedAndAvailableSlotCount',  parkingController.allocatedAndAvailableSlotCount)

router.get('/:lotId/vehicleCountByColour',  parkingController.vehicleCountByColour)

router.get('/:lotId/status',  parkingController.parkingLotStatus)

router.get('/:lotId/vehicles/:vehicleNumber/vehiclePosition',  parkingController.allocatedAndAvailableSlotCount)

router.post('/create',  parkingController.createParkingLot)

router.delete('/:lotId/delete',  parkingController.deleteParkingLot)

module.exports = router