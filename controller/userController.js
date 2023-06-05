const putItem = require("../database/dbOperations/putItem")
const getItem = require("../database/dbOperations/getItem")
const { randomUUID } = require('crypto')


async function register(req,res) {
    console.log("controller")
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
        let user = await putItem(options)
    
        console.log("newUser",user)
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