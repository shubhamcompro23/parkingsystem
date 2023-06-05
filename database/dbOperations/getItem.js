const db = require('../db');

async function getItem(options) {

    try{
        const params = {
            TableName: options.table,
            Key : options.key,
        }
        if(options.projectionExpression){
            params.projectionExpression = options.projectionExpression
        }
        const data = await db.dynamodb.getItem(params).promise()
        return data
    }catch(err){
        return err
    }
}

module.exports = getItem
