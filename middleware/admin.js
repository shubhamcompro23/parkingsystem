const getItem = require("../dbOperations/getItem")


async function isAdmin(req,res,next) {
    try{

        const user = await getItem(req)

        if(user.role != "admin"){
            res.send({
                statusCode: 403,
                message: "user does not have access"
            })
        }
        next()
    
    }catch(err){
        res.send({
            statusCode: 500,
            message: "Internal server eror"
        })
    }
}

module.exports = isAdmin