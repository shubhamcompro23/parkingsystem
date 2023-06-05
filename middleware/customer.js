const common = require("../utils/common")


async function isCustomer(req,res,next) {
    try{

        const user = await common.getUser(req)
        if(user.role != "admin" || user.role != "customer"){
            res.send({
                statusCode: 403,
                message: "please register"
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

module.exports = isCustomer