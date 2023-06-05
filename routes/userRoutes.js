const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")

console.log("routes")

router.post('/register',  userController.register)


module.exports = router