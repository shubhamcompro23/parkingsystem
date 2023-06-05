const getItem = require("../database/dbOperations/getItem")

async function getUser(req) {

    const options = {
        table : "User",
        key: {
            userId: req.body.userId
        }
    }

    const user = await getItem(options)

    if(!user){
        res.send({
            statusCode: 403,
            message: "User not found"
        })
    }

    return user
}

async function getParkingLot(req) {

    const options = {
        table : "ParkingLot",
        key: {
            lotId: req.params.lotId
        }
    }

    const parkingLot = await getItem(options)

    if(!parkingLot){
        res.send({
            statusCode: 403,
            message: "ParkingLot not found"
        })
    }

    return user
}


module.exports = {
    getUser,
    getParkingLot
}