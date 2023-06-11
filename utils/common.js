const dbOperations = require("../database/dbOperations")

async function getUser(req) {
    const options = {
        table : "User",
        key: {
            userId: req.body.userId
        }
    }

    const user = await dbOperations.get(options)

    return user
}

async function getParkingLot(req) {
    const options = {
        table : "ParkingLot",
        key: {
            lotId: req.params.lotId
        }
    }

    const parkingLot = await dbOperations.get(options)

    return parkingLot
}

async function vehicleDetails(req) {
    let options = {
        table : "Vehicle",
        key: {
            lotId: req.params.lotId,
            vehicleNumber: req.params.vehicleNumber
        }
    }
    const vehicleDetails = await dbOperations.get(options)
    return vehicleDetails
}


module.exports = {
    getUser,
    getParkingLot,
    vehicleDetails
}