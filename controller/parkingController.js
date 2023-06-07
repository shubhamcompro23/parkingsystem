const { randomUUID } = require('crypto')
const db = require("../database/db")
const dbOperations = require("../database/dbOperations")

const common = require("../utils/common")

async function createParkingLot(req, res) {
    try {
      let uniqueId = randomUUID();
      let levelDetails = req.body.levelDetails;
      let parkingLevelDetails = [];
  
      for (let i = 0; i < levelDetails.length; i++) {
        let levelObject = {
          PutRequest: {
            Item: {
              lotId: uniqueId,
              LevelNo: levelDetails[i].levelNo,
              availableSlot: levelDetails[i].availableSlot,
              allocatedSlot: levelDetails[i].allocatedSlot,
            },
          },
        };
  
        parkingLevelDetails.push(levelObject);
      }
  
      let options = {
        requestItems: {
          "ParkingLot": [
            {
              PutRequest: {
                Item: {
                  lotId: uniqueId,
                  baseCharges: req.body.baseCharges,
                  baseChargeTimeInHrs: req.body.baseChargeTimeInHrs,
                  chargesPerHour: req.body.chargesPerHour,
                  reserveCharges: req.body.reserveCharges,
                  maxReserveTimeInHrs: req.body.maxReserveTimeInHrs,
                  totalLevel: req.body.totalLevel,
                }
              }
            }
          ],
          "ParkingLevel": parkingLevelDetails
        },
      };

      const data = await dbOperations.batchWrite(options)
      
      res.send({
        message: "Parking lot successfully created",
        statusCode: 201,
        data
      })
    } catch (err) {
        if(err.code === "ValidationException"){
            return res.send({
                message: err.message,
                statusCode: err.statusCode,
                data: err
            })
        }
        res.send({
            message: err.message,
            statusCode: 500,
            data: err
        })
    }
  }

async function deleteParkingLot(req, res) {
    try{
        let lotId = req.params.lotId

        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req,res)
        
        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 401
            })
        }

        //Check the slot of parking lot is either reserve or parked

        let options = {
            table: "Vehicle",
            KeyConditionExpression: "lotId = :lotId" ,
            ExpressionAttributeValues : {
                ":lotId": req.params.lotId
            }
        }

        const parkedVehicle = await dbOperations.query(options)

        //If count > 0, return error (parking lot can not be deleted).

        if(parkedVehicle.Count > 0){
            return res.send({
                message: "Parking lot can not be deleted",
                statusCode: 401
            })
        }

        //If count = 0, then delete the parking lot record from both tables i.e (PARKING LOT and PARKING LEVEL).

        
        let queryOptions = {
            table: "ParkingLevel",
            KeyConditionExpression: "lotId = :lotId" ,
            ExpressionAttributeValues : {
                ":lotId": req.params.lotId
            }
        }
        const parkingLotLevels = await dbOperations.query(queryOptions)

        let parkingLevelDetails = [];

        for (let i = 0; i < parkingLotLevels.Items.length; i++) {
            let levelObject = {
                DeleteRequest: {
                    Key: { 
                        lotId: req.params.lotId,
                        LevelNo: parkingLotLevels.Items[i].LevelNo
                    }
                },
            };
      
            parkingLevelDetails.push(levelObject);
          }

        let deleteOptions = {
            requestItems: {
              "ParkingLot": [
                {
                    DeleteRequest: {
                        Key: { 
                            lotId: req.params.lotId,
                        }
                    },
                }
              ],
              "ParkingLevel": parkingLevelDetails
            }
        };

        const data = await dbOperations.batchWrite(deleteOptions)

        res.send({
            message: "Parking Lot successfully deleted",
            statusCode: 200,
            data: data
        })
    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            data: err
        })
    }
}

async function allocatedAndAvailableSlotCount(req,res) {
    try{
        
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req,res)

        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 401
            })
        }

        let queryOptions = {
            table: "ParkingLevel",
            KeyConditionExpression: "lotId = :lotId" ,
            ExpressionAttributeValues : {
                ":lotId": req.params.lotId
            }
        }
        const parkingLotLevels = await dbOperations.query(queryOptions)

        console.log("parkingLotLevels.Items", parkingLotLevels.Items)

        let availableSlot = 0
        let allocatedSlot = 0

        for (let i = 0; i < parkingLotLevels.Items.length; i++) {
            availableSlot = availableSlot + parkingLotLevels.Items[i].availableSlot.length
            allocatedSlot = allocatedSlot + parkingLotLevels.Items[i].allocatedSlot.length
        }

        res.send({
            message: "Successfully get the count of available and allocated slots",
            statusCode: 200,
            data: {
                availableSlot,
                allocatedSlot
            }
        })
    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            data: err
        })
    }

}

async function vehiclePosition() {
    try{
            
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req,res)

        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 401
            })
        }

        const details = await common.vehicleDetails(req,res)

        if(Object.keys(details).length === 0){
            return res.send({
                message: "Vehicle not found",
                statusCode: 401
            })
        }

        res.send({
            message: "Successfully get the vehicle position",
            statusCode: 200,
            data: {
                lotId: details.lotId,
                levelNumber: details.levelNumber,
                slotNumber: details.slotNumber
            }
        })

    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            data: err
        })
    }
}

async function vehicleCountByColour() {
    try{
            
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req,res)

        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 401
            })
        }

        let options = {
            table: "Vehicle",
            KeyConditionExpression: "lotId = :lotId",
            ExpressionAttributeValues : {
                ":lotId": req.params.lotId,
                ":colour": req.body.black
            },
            FilterExpression: 'colour = :colour',
        }

        const data = await dbOperations.query(options)

        res.send({
            message: "Successfully get the vehicle count",
            statusCode: 200,
            data: {
                count : data.Count 
            }
        })

    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            data: err
        })
    }
}

async function parkingLotStatus() {
    try{
            
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req,res)

        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 401
            })
        }

        let options = {
            table: "Vehicle",
            KeyConditionExpression: "lotId = :lotId",
            ExpressionAttributeValues : {
                ":lotId": req.params.lotId,
            }
        }

        const data = await dbOperations.query(options)

        let status = []

        for (let i = 0; i < parkingLotLevels.Items.length; i++) {
            let str = `${parkingLotLevels.Items[i].vehicleNumber}(${parkingLotLevels.Items[i].levelNumber}-${parkingLotLevels.Items[i].slotNumber})${parkingLotLevels.Items[i].status}`
            status.push(str)
        }

        res.send({
            message: "Successfully get the vehicle count",
            statusCode: 200,
            data: {
                status 
            }
        })

    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            data: err
        })
    }
}

module.exports = {
    createParkingLot,
    deleteParkingLot,
    allocatedAndAvailableSlotCount,
    vehiclePosition,
    vehicleCountByColour,
    parkingLotStatus
}