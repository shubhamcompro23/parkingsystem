const { randomUUID } = require('crypto')
const db = require("../database/db")
const dbOperations = require("../database/dbOperations")

const common = require("../utils/common");

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

async function vehiclePosition(req,res) {
    try{
            
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req)

        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 401
            })
        }

        const details = await common.vehicleDetails(req)

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
                lotId: details.Item.lotId,
                levelNumber: details.Item.levelNumber,
                slotNumber: details.Item.slotNumber
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

async function vehicleCountByColour(req, res ) {
    try{
            
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req)

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
                ":colour": req.body.colour
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

async function parkingLotStatus( req, res ) {
    try{
            
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req)

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

        for (let i = 0; i < data.Items.length; i++) {
            let str = `${data.Items[i].vehicleNumber}(${data.Items[i].levelNumber}-${data.Items[i].slotNumber})${data.Items[i].status}`
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

async function parkVehicle(req,res) {
    try {
        let levelNumber
        let slotNumber
        let startTime
        let validity
        //check if the parking lot is exist or not
        const parkingLot = await common.getParkingLot(req)

        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 404
            })
        }

        //check the reservation of vehicle

        let reservation = await common.vehicleDetails(req)

        if(reservation.Item?.status === "parked"){
            return res.send({
                message: "your vehicle is already parked",
                statusCode: 400
            }) 
        }

        if(reservation.Item?.status === "resereved"){
            validity = (Date.now()-reservation.Item.startTime)/3600000 < parkingLot.Item.maxReserveTimeInHrs
        }

        //if parkingfSlot is not reserved
        if( Object.keys(reservation).length === 0 ){
            let condition = false
            let lastEvaluatedKey = null
            let batchSize = 5

            for (let i = 0; i < parkingLot.Item.totalLevel; i = i + 5) {
                if(condition){
                    break ;
                }

                const queryParams = {
                    table: "ParkingLevel",
                    KeyConditionExpression: '#lotId = :lotId',
                    ExpressionAttributeNames: { '#lotId': 'lotId' },
                    ExpressionAttributeValues: { ':lotId': req.params.lotId },
                    Limit: batchSize,
                    ExclusiveStartKey: lastEvaluatedKey
                };

                const parkingLevelDetails = await dbOperations.query(queryParams)

                for (let i = 0; i < parkingLevelDetails.Items.length; i++) {
                    if(parkingLevelDetails.Items[i].availableSlot.length > 0){
                        condition = true
                        slotNumber = parkingLevelDetails.Items[i].availableSlot.shift()
                        let allocatedSlot = parkingLevelDetails.Items[i].allocatedSlot.push(slotNumber)
                        levelNumber =  parkingLevelDetails.Items[i].LevelNo
                        const updateParams = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                                "#AVL": "availableSlot",
                                "#ALC": "allocatedSlot"
                            },
                            expressionAttributeValues: {
                                ":avl": parkingLevelDetails.Items[i].availableSlot,
                                ":alc": parkingLevelDetails.Items[i].allocatedSlot
                            },
                            key: {
                               lotId: req.params.lotId,
                               LevelNo: parkingLevelDetails.Items[i].LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };

                        const updatedData = await dbOperations.update(updateParams)

                        startTime = Date.now()

                        let options = {
                            item : {
                                lotId: req.params.lotId,
                                levelNumber: parkingLevelDetails.Items[i].LevelNo,
                                slotNumber: slotNumber,
                                userId: req.body.userId,
                                colour: req.body.colour,
                                vehicleNumber: req.params.vehicleNumber,
                                startTime: startTime,
                                isReserve: false,
                                status: req.body.status,
                            },
                            table: "Vehicle",
                        }
                        const parked = await dbOperations.put(options)
                        break;
                    }

                }

                lastEvaluatedKey = parkingLevelDetails.LastEvaluatedKey
            }

            if(condition === false ){
                res.send({
                    message: "All parking slot are full",
                    statusCode: 400,
                })
            }
        }

        //if parkingfSlot is reserved and have validity
        if(Object.keys(reservation).length > 0 &&  validity){
            let condition = false
            let lastEvaluatedKey = null
            let batchSize = 5
            for (let i = 0; i <= reservation.Item.levelNumber; i = i + 5) {
                if(condition){
                    break ;
                }

                const queryParams = {
                    table: "ParkingLevel",
                    KeyConditionExpression: '#lotId = :lotId',
                    ExpressionAttributeNames: { '#lotId': 'lotId' },
                    ExpressionAttributeValues: { ':lotId': req.params.lotId },
                    Limit: batchSize,
                    ExclusiveStartKey: lastEvaluatedKey
                };

                const parkingLevelDetails = await dbOperations.query(queryParams)

                for (let i = 0; i < parkingLevelDetails.Items.length; i++) {
                    if(parkingLevelDetails.Items[i].availableSlot.length > 0 && parkingLevelDetails.Items[i].LevelNo <= reservation.Item.levelNumber && parkingLevelDetails.Items[i].availableSlot[0] < reservation.Item.slotNumber){
                        condition = true
                        slotNumber = parkingLevelDetails.Items[i].availableSlot.shift()
                        let allocatedSlot = parkingLevelDetails.Items[i].allocatedSlot.push(slotNumber)
                        levelNumber =  parkingLevelDetails.Items[i].LevelNo
                        const updateParams = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                                "#AVL": "availableSlot",
                                "#ALC": "allocatedSlot"
                            },
                            expressionAttributeValues: {
                                ":avl": parkingLevelDetails.Items[i].availableSlot,
                                ":alc": parkingLevelDetails.Items[i].allocatedSlot
                            },
                            key: {
                               lotId: req.params.lotId,
                               LevelNo: parkingLevelDetails.Items[i].LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };

                        const updatedData = await dbOperations.update(updateParams)

                        //Update the level(previous reserve  level) in the PARKING LEVEL table.
                        
                        const reserveSlotLevelParams= {
                            key: {
                              lotId: req.params.lotId,
                              LevelNo: reservation.Item.levelNumber
                            },
                            table : "ParkingLevel"
                        };

                        const reserveSlotLevelDetails = await dbOperations.get(reserveSlotLevelParams)

                        let index = reserveSlotLevelDetails.Item.allocatedSlot.indexOf(reservation.Item.slotNumber)
                        let resrevedSlotNumber = reserveSlotLevelDetails.Item.allocatedSlot.splice(index, 1)[0] 

                        let reservedAvailableSlot = reserveSlotLevelDetails.Item.availableSlot.push(resrevedSlotNumber)
                        let sortedavailableSlotArray= reserveSlotLevelDetails.Item.availableSlot.sort()

                        let params = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                               "#AVL": "availableSlot",
                               "#ALC": "allocatedSlot"
                              },
                            expressionAttributeValues: {
                               ":avl": sortedavailableSlotArray,
                               ":alc": reserveSlotLevelDetails.Item.allocatedSlot,
                            },
                            key: {
                              lotId: reserveSlotLevelDetails.Item.lotId,
                              LevelNo: reserveSlotLevelDetails.Item.LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };

                        const updatedResrsevedLevel = await dbOperations.update(params)
                    
                        //update a record with all the required details in the VEHICLE table
                        startTime = Date.now()
                
                        const updateVehicleParams = {
                            table: "Vehicle",
                            expressionAttributeNames: {
                                "#LVL": "levelNumber",
                                "#SLT": "slotNumber",
                                "#ST": "startTime",
                                "#STS": "status",
                                },
                            expressionAttributeValues: {
                                ":lvl": parkingLevelDetails.Items[i].LevelNo,
                                ":slt": slotNumber,
                                ":st": startTime,
                                ":sts": req.body.status,
                            },
                            key: {
                                lotId: req.params.lotId,
                                vehicleNumber: req.params.vehicleNumber
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #LVL= :lvl, #SLT= :slt,#ST= :st, #STS= :sts"
                        };

                        const parked = await dbOperations.update(updateVehicleParams)
                        break;
                    }
                }
                lastEvaluatedKey = parkingLevelDetails.LastEvaluatedKey
            }
            if(condition === false ){
                // parked in the reserve Slot i.e update the vehicle table
                startTime = Date.now()
                levelNumber = reservation.Item.levelNumber
                slotNumber = reservation.Item.slotNumber

                const updateVehicleParams = {
                    table: "Vehicle",
                    expressionAttributeNames: {
                        "#ST": "startTime",
                        "#STS": "status",
                    },
                    expressionAttributeValues: {
                        ":st": startTime,
                        ":sts": req.body.status,
                    },
                    key: {
                        lotId: req.params.lotId,
                        vehicleNumber: req.params.vehicleNumber
                    },
                    returnValues: "ALL_NEW", 
                    updateExpression: "Set #ST= :st, #STS= :sts"
                };

                const parked = await dbOperations.update(updateVehicleParams)
            }
        }

        if(Object.keys(reservation).length > 0 &&  !validity){

            let condition = false
            let lastEvaluatedKey = null
            let batchSize = 5

            for (let i = 0; i < parkingLot.Item.totalLevel; i = i + 5) {
                if(condition){
                    break ;
                }

                const queryParams = {
                    table: "ParkingLevel",
                    KeyConditionExpression: '#lotId = :lotId',
                    ExpressionAttributeNames: { '#lotId': 'lotId' },
                    ExpressionAttributeValues: { ':lotId': req.params.lotId },
                    Limit: batchSize,
                    ExclusiveStartKey: lastEvaluatedKey
                };

                const parkingLevelDetails = await dbOperations.query(queryParams)

                for (let i = 0; i < parkingLevelDetails.Items.length; i++) {
                    if(parkingLevelDetails.Items[i].availableSlot.length > 0){
                        condition = true
                        slotNumber = parkingLevelDetails.Items[i].availableSlot.shift()
                        let allocatedSlot = parkingLevelDetails.Items[i].allocatedSlot.push(slotNumber)
                        levelNumber =  parkingLevelDetails.Items[i].LevelNo
                        const updateParams = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                                "#AVL": "availableSlot",
                                "#ALC": "allocatedSlot"
                            },
                            expressionAttributeValues: {
                                ":avl": parkingLevelDetails.Items[i].availableSlot,
                                ":alc": parkingLevelDetails.Items[i].allocatedSlot
                            },
                            key: {
                               lotId: req.params.lotId,
                               LevelNo: parkingLevelDetails.Items[i].LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };

                        const updatedData = await dbOperations.update(updateParams)

                        // update the previous reserve slot

                        const reserveSlotLevelParams= {
                            key: {
                              lotId: req.params.lotId,
                              LevelNo: reservation.Item.levelNumber
                            },
                            table : "ParkingLevel"
                        };

                        const reserveSlotLevelDetails = await dbOperations.get(reserveSlotLevelParams)

                        let index = reserveSlotLevelDetails.Item.allocatedSlot.indexOf(reservation.Item.slotNumber)
                        let resrevedSlotNumber = reserveSlotLevelDetails.Item.allocatedSlot.splice(index, 1)[0] 

                        let reservedAvailableSlot = reserveSlotLevelDetails.Item.availableSlot.push(resrevedSlotNumber)
                        let sortedavailableSlotArray= reserveSlotLevelDetails.Item.availableSlot.sort()

                        let params = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                               "#AVL": "availableSlot",
                               "#ALC": "allocatedSlot"
                              },
                            expressionAttributeValues: {
                               ":avl": sortedavailableSlotArray,
                               ":alc": reserveSlotLevelDetails.Item.allocatedSlot,
                            },
                            key: {
                              lotId: reserveSlotLevelDetails.Item.lotId,
                              LevelNo: reserveSlotLevelDetails.Item.LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };

                        const updatedResrsevedLevel = await dbOperations.update(params)
                    
                        //update a record with all the required details in the VEHICLE table
                        startTime = Date.now()
                
                        const updateVehicleParams = {
                            table: "Vehicle",
                            expressionAttributeNames: {
                                "#LVL": "levelNumber",
                                "#SLT": "slotNumber",
                                "#ST": "startTime",
                                "#STS": "status",
                                },
                            expressionAttributeValues: {
                                ":lvl": parkingLevelDetails.Items[i].LevelNo,
                                ":slt": slotNumber,
                                ":st": startTime,
                                ":sts": req.body.status,
                            },
                            key: {
                                lotId: req.params.lotId,
                                vehicleNumber: req.params.vehicleNumber
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #LVL= :lvl, #SLT= :slt,#ST= :st, #STS= :sts"
                        };

                        const parked = await dbOperations.update(updateVehicleParams)

                        break;
                    }

                }

                lastEvaluatedKey = parkingLevelDetails.LastEvaluatedKey
            }

            if(condition === false ){
                // parked in the reserve Slot i.e update the vehicle table
                startTime = Date.now()
                levelNumber = reservation.Item.levelNumber
                slotNumber = reservation.Item.slotNumber

                const updateVehicleParams = {
                    table: "Vehicle",
                    expressionAttributeNames: {
                        "ST": "startTime",
                        "STS": "status",
                    },
                    expressionAttributeValues: {
                        ":st": startTime,
                        ":sts": req.body.status,
                    },
                    key: {
                        lotId: req.params.lotId,
                        vehicleNumber: req.params.vehicleNumber
                    },
                    returnValues: "ALL_NEW", 
                    updateExpression: "Set #ST= :st, #STS= :sts"
                };

                const parked = await dbOperations.update(updateVehicleParams)
            }


        }


        res.send({
            message: "Successfully parked",
            statusCode: 200,
            data: {
                lotId  : req.params.lotId,
                LevelNumber :   levelNumber,
                slotNumber : slotNumber,
                veichleNumber: req.params.vehicleNumber,
                userId :  req.body.userId,
                colour: req.body.colour,
                startTime: new Date(startTime),
                status:  req.body.status

            }
        })
    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            err
        })
    }
}

async function reserveParkingSlot( req, res ) {
    try{
        let levelNumber
        let slotNumber
        let startTime
        let validity
    
        const parkingLot = await common.getParkingLot(req)
    
        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 404
            })
        }
    
        //check the reservation of vehicle
    
        let reservation = await common.vehicleDetails(req)
    
        if(reservation.Item?.status === "parked"){
            return res.send({
                message: "your vehicle is already parked",
                statusCode: 400
            }) 
        }
    
        if(reservation.Item?.status === "resereved"){
            validity = (Date.now()-reservation.Item.startTime)/3600000 < parkingLot.Item.maxReserveTimeInHrs
            // validity = (Date.now()-startTime)/3600000 < parkingLot.Item.maxReserveTimeInHrs
        }
    
        if(reservation.Item?.status === "resereved" && validity ){
            return res.send({
                message: "You already reserved the parking Slot",
                statusCode: 400
            }) 
        }
    
        if( Object.keys(reservation).length === 0 ){
            let condition = false
            let lastEvaluatedKey = null
            let batchSize = 5
    
            for (let i = 0; i < parkingLot.Item.totalLevel; i = i + 5) {
                if(condition){
                    break ;
                }
    
                const queryParams = {
                    table: "ParkingLevel",
                    KeyConditionExpression: '#lotId = :lotId',
                    ExpressionAttributeNames: { '#lotId': 'lotId' },
                    ExpressionAttributeValues: { ':lotId': req.params.lotId },
                    Limit: batchSize,
                    ExclusiveStartKey: lastEvaluatedKey
                };
    
                const parkingLevelDetails = await dbOperations.query(queryParams)
    
                for (let i = 0; i < parkingLevelDetails.Items.length; i++) {
                    if(parkingLevelDetails.Items[i].availableSlot.length > 0){
                        condition = true
                        slotNumber = parkingLevelDetails.Items[i].availableSlot.shift()
                        let allocatedSlot = parkingLevelDetails.Items[i].allocatedSlot.push(slotNumber)
                        levelNumber =  parkingLevelDetails.Items[i].LevelNo
                        const updateParams = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                                "#AVL": "availableSlot",
                                "#ALC": "allocatedSlot"
                            },
                            expressionAttributeValues: {
                                ":avl": parkingLevelDetails.Items[i].availableSlot,
                                ":alc": parkingLevelDetails.Items[i].allocatedSlot
                            },
                            key: {
                               lotId: req.params.lotId,
                               LevelNo: parkingLevelDetails.Items[i].LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };
    
                        const updatedData = await dbOperations.update(updateParams)
    
                        startTime = Date.now()
    
                        let options = {
                            item : {
                                lotId: req.params.lotId,
                                levelNumber: parkingLevelDetails.Items[i].LevelNo,
                                slotNumber: slotNumber,
                                userId: req.body.userId,
                                colour: req.body.colour,
                                vehicleNumber: req.params.vehicleNumber,
                                startTime: startTime,
                                isReserve: true,
                                status: req.body.status,
                            },
                            table: "Vehicle",
                        }
                        const reserve = await dbOperations.put(options)
                        break;
                    }
                }
    
                lastEvaluatedKey = parkingLevelDetails.LastEvaluatedKey
            }
    
            if(condition === false ){
                return res.send({
                    message: "All parking slot are full",
                    statusCode: 400,
                })
            }
        }
    
        if( Object.keys(reservation).length > 0 && !validity ){
            let condition = false
            let lastEvaluatedKey = null
            let batchSize = 5
    
            for (let i = 0; i < parkingLot.Item.totalLevel; i = i + 5) {
                if(condition){
                    break ;
                }
    
                const queryParams = {
                    table: "ParkingLevel",
                    KeyConditionExpression: '#lotId = :lotId',
                    ExpressionAttributeNames: { '#lotId': 'lotId' },
                    ExpressionAttributeValues: { ':lotId': req.params.lotId },
                    Limit: batchSize,
                    ExclusiveStartKey: lastEvaluatedKey
                };
    
                const parkingLevelDetails = await dbOperations.query(queryParams)
    
                for (let i = 0; i < parkingLevelDetails.Items.length; i++) {
                    if(parkingLevelDetails.Items[i].availableSlot.length > 0){
                        condition = true
                        slotNumber = parkingLevelDetails.Items[i].availableSlot.shift()
                        let allocatedSlot = parkingLevelDetails.Items[i].allocatedSlot.push(slotNumber)
                        levelNumber =  parkingLevelDetails.Items[i].LevelNo
                        const updateParams = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                                "#AVL": "availableSlot",
                                "#ALC": "allocatedSlot"
                            },
                            expressionAttributeValues: {
                                ":avl": parkingLevelDetails.Items[i].availableSlot,
                                ":alc": parkingLevelDetails.Items[i].allocatedSlot
                            },
                            key: {
                               lotId: req.params.lotId,
                               LevelNo: parkingLevelDetails.Items[i].LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };
    
                        const updatedData = await dbOperations.update(updateParams)
    
                        //update a record with all the required details in the VEHICLE table
                        startTime = Date.now()
    
                        const updateVehicleParams = {
                            table: "Vehicle",
                            expressionAttributeNames: {
                                "#LVL": "levelNumber",
                                "#SLT": "slotNumber",
                                "#ST": "startTime",
                                "#STS": "status",
                                },
                            expressionAttributeValues: {
                                ":lvl": parkingLevelDetails.Items[i].LevelNo,
                                ":slt": slotNumber,
                                ":st": startTime,
                                ":sts": req.body.status,
                            },
                            key: {
                                lotId: req.params.lotId,
                                vehicleNumber: req.params.vehicleNumber
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #LVL= :lvl, #SLT= :slt, #ST= :st, #STS= :sts"
                        };
    
                        const parked = await dbOperations.update(updateVehicleParams)
    
                        //Update the level(previous reserve  level) in the PARKING LEVEL table.
    
                        const reserveSlotLevelParams= {
                            key: {
                              lotId: req.params.lotId,
                              LevelNo: reservation.Item.levelNumber
                            },
                            table : "ParkingLevel"
                        };
    
                        const reserveSlotLevelDetails = await dbOperations.get(reserveSlotLevelParams)
    
                        let index = reserveSlotLevelDetails.Item.allocatedSlot.indexOf(reservation.Item.slotNumber)
                        let resrevedSlotNumber = reserveSlotLevelDetails.Item.allocatedSlot.splice(index, 1)[0] 
                        reserveSlotLevelDetails.Item.availableSlot.push(resrevedSlotNumber)
            
                        let sortedavailableSlotArray= reserveSlotLevelDetails.Item.availableSlot.sort()
                        let updatepreviousReserveParams = {
                            table: "ParkingLevel",
                            expressionAttributeNames: {
                               "#AVL": "availableSlot",
                               "#ALC": "allocatedSlot"
                              },
                            expressionAttributeValues: {
                               ":avl": sortedavailableSlotArray,
                               ":alc": reserveSlotLevelDetails.Item.allocatedSlot,
                            },
                            key: {
                              lotId: reserveSlotLevelDetails.Item.lotId,
                              LevelNo: reserveSlotLevelDetails.Item.LevelNo
                            },
                            returnValues: "ALL_NEW", 
                            updateExpression: "Set #AVL= :avl, #ALC= :alc"
                        };
                        const updatedResrsevedLevel = await dbOperations.update(updatepreviousReserveParams)
                        break;
                    }
                }
            }
            if(condition === false ){
                res.send({
                    message: "All parking slot are full",
                    statusCode: 400,
                })
            }
        }
        res.send({
            message: "Successfully parked",
            statusCode: 200,
            data: {
                lotId  : req.params.lotId,
                LevelNumber :   levelNumber,
                slotNumber : slotNumber,
                veichleNumber: req.params.vehicleNumber,
                userId :  req.body.userId,
                colour: req.body.colour,
                startTime: new Date(startTime),
                status:  req.body.status
    
            }
        })
    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            err
        })
    }
}

async function unParkVehicle( req, res ) {
    try{
        const parkingLot = await common.getParkingLot(req)
    
        if(Object.keys(parkingLot).length === 0){
            return res.send({
                message: "ParkingLot not found",
                statusCode: 404
            })
        }
        let parkingDetails = await common.vehicleDetails(req)

        if(Object.keys(parkingDetails).length === 0 || parkingDetails.Item.status === "resereved"){
            return res.send({
                message: "Vehicle not parked",
                statusCode: 404
            })
        }

        let options = {
            table: "Vehicle",
            key: {
                lotId: req.params.lotId,
                vehicleNumber: req.params.vehicleNumber
            },
            returnValues: "ALL_OLD"
        }
        let deleteParkingRecord = await dbOperations.deleteItem(options)

        // Create a record in the INVOICE table with all the details.

        let uniqueId = randomUUID()

        let endTime = Date.now()

        let totalParkingHrs = (endTime -  parkingDetails.Item.startTime)/ 3600000

        let totalCharges = parkingLot.Item.baseCharges 

        if(totalParkingHrs - parkingLot.Item.baseChargeTimeInHrs > 0){
            totalCharges = totalCharges + (totalParkingHrs - parkingLot.Item.baseChargeTimeInHrs) * parkingLot.Item.chargesPerHour
        }

        if(parkingDetails.Item.isReserve){
            totalCharges = totalCharges + parkingLot.Item.reserveCharges
        }


        let invoiceOptions = {
            table: "Invoice",
            item: {
                invoiceId: uniqueId,
                lotId: req.params.lotId,
                levelNumber: parkingDetails.Item.levelNumber,
                slotNumber: parkingDetails.Item.slotNumber,
                userId: parkingDetails.Item.userId,
                vehicleNumber: req.params.vehicleNumber,
                starttime: parkingDetails.Item.startTime,
                endTime: endTime,
                baseCharges: parkingLot.Item.baseCharges,
                baseChargeTimeInHrs: parkingLot.Item.baseChargeTimeInHrs,
                chargesPerHour: parkingLot.Item.chargesPerHour,
                totalParkingHrs: totalParkingHrs,
                totalCharges: totalCharges,
            }
        }

        if(parkingDetails.Item.isReserve){
            invoiceOptions.item.reserveCharges = parkingLot.Item.reserveCharges,
            invoiceOptions.item.maxReserveTimeInHrs = parkingLot.Item.maxReserveTimeInHrs
        }

        let createInvoice = await dbOperations.put(invoiceOptions)

        const levelParams= {
            key: {
              lotId: req.params.lotId,
              LevelNo: parkingDetails.Item.levelNumber
            },
            table : "ParkingLevel"
        };

        const levelDetails = await dbOperations.get(levelParams)

        let index = levelDetails.Item.allocatedSlot.indexOf(parkingDetails.Item.slotNumber)
        let resrevedSlotNumber = levelDetails.Item.allocatedSlot.splice(index, 1)[0] 
        levelDetails.Item.availableSlot.push(resrevedSlotNumber)

        let sortedavailableSlotArray= levelDetails.Item.availableSlot.sort()

        let updateOptions = {
            table: "ParkingLevel",
            expressionAttributeNames: {
               "#AVL": "availableSlot",
               "#ALC": "allocatedSlot"
              },
            expressionAttributeValues: {
               ":avl": sortedavailableSlotArray,
               ":alc": levelDetails.Item.allocatedSlot,
            },
            key: {
              lotId: levelDetails.Item.lotId,
              LevelNo: levelDetails.Item.LevelNo
            },
            returnValues: "ALL_NEW", 
            updateExpression: "Set #AVL= :avl, #ALC= :alc"
        };

        let updateParkingLevel = await dbOperations.update(updateOptions)

        res.send({

            message: "Successfully parked",
            statusCode: 200,
            data: {
                invoiceId: uniqueId,
                lotId: req.params.lotId,
                levelNumber: parkingDetails.Item.levelNumber,
                slotNumber: parkingDetails.Item.slotNumber,
                userId: parkingDetails.Item.userId,
                vehicleNumber: req.params.vehicleNumber,
                starttime: new Date(parkingDetails.Item.startTime ),
                endTime: new Date(endTime),
                baseCharges: parkingLot.Item.baseCharges,
                baseChargeTimeInHrs: parkingLot.Item.baseChargeTimeInHrs,
                chargesPerHour: parkingLot.Item.chargesPerHour,
                totalParkingHrs: totalParkingHrs,
                totalCharges: totalCharges,
            }
        })

    }catch(err){
        res.send({
            message: "Internal server error",
            statusCode: 500,
            err
        })
    }
}

module.exports = {
    createParkingLot,
    deleteParkingLot,
    allocatedAndAvailableSlotCount,
    vehiclePosition,
    vehicleCountByColour,
    parkingLotStatus,
    parkVehicle,
    reserveParkingSlot,
    unParkVehicle
}