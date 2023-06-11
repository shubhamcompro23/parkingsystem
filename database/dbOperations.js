const db = require('../database/db');

async function get(options) {
    const params = {
        TableName: options.table,
        Key : options.key,
    }
    if(options.projectionExpression){
        params.projectionExpression = options.projectionExpression
    }
    const data = await db.dynamodb.get(params).promise()
    return data
}

async function put(options){
    let params = {
    TableName: options.table,
    Item: options.item,
    // ReturnValues: "ALL_NEW",
    };
    // if(options.conditionExpression){
    //     params.ConditionExpression = options.conditionExpression
    // }

    const data = await db.dynamodb.put(params).promise()

    return data
  
}

async function query(options) {
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

    if(options.ExpressionAttributeNames){
        params.ExpressionAttributeNames = options.ExpressionAttributeNames
    } 

    if(options.Limit){
        params.Limit = options.Limit
    } 

    if("ExclusiveStartKey" in options){
        params.ExclusiveStartKey = options.ExclusiveStartKey
    } 

    const data = await db.dynamodb.query(params).promise()

    return data
}

async function batchWrite(options) {
    let params = {
        RequestItems : options.requestItems
    }

    const data = await db.dynamodb.batchWrite(params).promise()

    return data
}

async function deleteItem(options) {
    let params = {
        TableName: options.table,
        Key: options.key
    }

    if(options.conditionExpression){
        params.ConditionExpression = options.conditionExpression
    }
    if(options.expressionAttributeNames){
        params.ExpressionAttributeNames =  options.expressionAttributeNames
    }
    if(options.expressionAttributeValue){
        params.ExpressionAttributeValue = options.expressionAttributeValue
    }
    if(options.returnValues){
        params.ReturnValues = options.returnValues
    }

    const data = await db.dynamodb.delete(params).promise()

    return data
}

async function update(options) {

    let params = {
        TableName: options.table,
        ExpressionAttributeNames: options.expressionAttributeNames,
        ExpressionAttributeValues: options.expressionAttributeValues,
        Key: options.key,
        ReturnValues: options.returnValues,
        UpdateExpression: options.updateExpression
    }

    if(options.returnValues){
        params.ReturnValues = options.returnValues
    }

    if(options.conditionExpression){
        params.ConditionExpression = options.conditionExpression
    }
  
  
    const data = await db.dynamodb.update(params).promise()

    return data
}



module.exports = {
    get,
    put,
    query,
    batchWrite,
    deleteItem,
    update
}