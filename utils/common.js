const dbOperations = require("../database/dbOperations")

async function getUser(req) {
    try{
        const options = {
            table : "User",
            key: {
                userId: req.body.userId
            }
        }
    
        const user = await dbOperations.get(options)
    
        return user
    }catch(err){
        return err
    }
}

async function getParkingLot(req,res) {
    try{
        const options = {
            table : "ParkingLot",
            key: {
                lotId: req.params.lotId
            }
        }
    
        const parkingLot = await dbOperations.get(options)

        return parkingLot
    }catch(err){
        return err
    }
}

async function vehicleDetails(req,res) {
    try{

        let options = {
            table : "Vehicle",
            key: {
                lotId: req.params.lotId,
                vehicleNumber: req.params.vehicleNumber
            }
        }
    
        const vehicleDetails = await dbOperations.get(options)

        return vehicleDetails
    }catch(err){
        return err
    }
}


module.exports = {
    getUser,
    getParkingLot,
    vehicleDetails
}