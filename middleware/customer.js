const common = require("../utils/common")


async function isCustomer(req,res,next) {
    try{

        const user = await common.getUser(req)
        if(!(user.Item.role === "admin" || user.Item.role === "customer")){
            return res.send({
                statusCode: 403,
                message: "please register"
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

module.exports = isCustomer