const { randomUUID } = require('crypto')
const db = require("../database/db")

async function createParkingLot(req,res) {
    try{
        let uniqueId = randomUUID()

        let levelDetails = req.body.levelDetails
    
        let parkingLevelDetails = []
    
        for (let i = 0; i < levelDetails.length; i++) {
            let levelObject = {
                PutRequest: {
                    Item: {
                        lotId: uniqueId,
                        levelNo: levelDetails[i].levelNo,
                        availableSlot: levelDetails[i].availableSlot,
                        allocatedSlot: levelDetails[i].allocatedSlot
                    }
                }
            }
    
            parkingLevelDetails.push(levelObject)
            
        }
    
        let params = {
            RequestItems: {
                'ParkingLot': [
                    {
                        PutRequest: {
                            Item: {
                                lotId: uniqueId,
                                baseCharges: req.body.baseCharges,
                                baseChargeTimeInHrs: req.body.baseChargeTimeInHrs,
                                chargesPerHour: req.body.chargesPerHour,
                                reserveCharges: req.body.reserveCharges,
                                maxReserveTimeInHrs: req.body.maxReserveTimeInHrs,
                                totalLevel:  req.body.totalLevel
                            }
                        }
                    }
                ],
                "ParkingLevel": parkingLevelDetails
            }
        }

        // console.log("params--", JSON.stringify(params, 0 , 2))
    
        const data = await db.dynamodb.batchWrite(params).promise()

        // console.log("data--", data)
    
        res.send({
            message: "Parking Lot successfully created",
            statusCode: 201,
            data: params
        })
    }catch(err){
        return err
    }
}



module.exports = {
    createParkingLot
}