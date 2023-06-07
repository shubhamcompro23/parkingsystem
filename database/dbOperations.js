const db = require('../database/db');

async function get(options) {

    try{
        const params = {
            TableName: options.table,
            Key : options.key,
        }
        if(options.projectionExpression){
            params.projectionExpression = options.projectionExpression
        }
        const data = await db.dynamodb.get(params).promise()
        return data
    }catch(err){
        return err
    }
}

async function put(options){

    try{
      let params = {
        TableName: options.table,
        Item: options.item,
        ReturnValues: "ALL_NEW",
      };
      if(options.conditionExpression){
          params.ConditionExpression = options.conditionExpression
      }
    
      const data = await db.dynamodb.put(params).promise()
  
      return data
    }catch(err){
      // if(err.code  === 'ConditionalCheckFailedException'){
      //   return "Item already exists"
      // }
      return err
    }
  
}

async function query(options) {
    try{
        let params = {
            TableName: options.table,
            KeyConditionExpression: options.KeyConditionExpression,
            ExpressionAttributeValues: options.ExpressionAttributeValues
        }

        if(options.FilterExpression){
            params.FilterExpression = options.FilterExpression
        }
    
        if(options.ProjectionExpression){
            params.ProjectionExpression = options.ProjectionExpression
        }
    
        const data = await db.dynamodb.query(params).promise()
    
        return data
    }catch(err){
        return err
    }
}

async function batchWrite(options) {
    try{
        let params = {
            RequestItems : options.requestItems
        }
    
        const data = await db.dynamodb.batchWrite(params).promise()
    
        return data
    }catch(err){
        return err
    }
}

async function deleteItem(options) {
    try{
        let params = {
            TableName: options.table,
            Key: options.key
        }

        if(options.ConditionExpression){
            params.ConditionExpression = options.conditionExpression
        }
        if(options.ExpressionAttributeNames){
            params.ExpressionAttributeNames =  options.expressionAttributeNames
        }
        if(options.ExpressionAttributeValue){
            params.ExpressionAttributeValue = options.expressionAttributeValue
        }
        if(options.ReturnValues){
            params.ReturnValues = options.returnValues
        }
    
        const data = await db.dynamodb.batchWrite(params).promise()
    
        return data
    }catch(err){
        return err
    }
}



module.exports = {
    get,
    put,
    query,
    batchWrite,
    deleteItem
}