const { randomUUID } = require('crypto')
const dbOperations = require("../database/dbOperations")



async function register(req,res) {
    try{
        let uniqueId = randomUUID()
        let options = {
            table : "User",
            item: {
                userId   : uniqueId,
                userName : req.body.userName,
                role     : req.body.role,
            },
            conditionExpression : `attribute_not_exists(userId) AND userId <> : ${uniqueId}`
        }
        let user = await dbOperations.put(options)
        res.send({
            status: 201,
            message: "User Successfully Registered",
            data: user
        })
    
    }catch(err){
        res.send(err)
    }
}

module.exports = {
    register
}