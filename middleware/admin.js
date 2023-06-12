const common = require("../utils/common")


async function isAdmin(req,res,next) {
    try{

        const user = await common.getUser(req)
        if(user.Item.role != "admin"){
            return res.send({
                statusCode: 403,
                message: "user does not have access"
            })
        }
        next()
    
    }catch(err){
        return res.send({
            statusCode: 500,
            message: "Internal server eror",
            err
        })
    }
}

module.exports = isAdmin