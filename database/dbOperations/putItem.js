const db = require("../db")

async function putItem(options){

  try{
    let params = {
      TableName: options.table,
      Item: options.item,
    //   ReturnValues: "ALL_NEW",
    };
    // if(options.conditionExpression){
    //     params.ConditionExpression = options.conditionExpression
    // }
  
    const data = await db.dynamodb.put(params).promise()

    return data
  }catch(err){
    // if(err.code  === 'ConditionalCheckFailedException'){
    //   return "Item with userId and sortKey already exists"
    // }
    return err
  }

}


module.exports = putItem
