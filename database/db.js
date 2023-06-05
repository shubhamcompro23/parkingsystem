const AWS = require("aws-sdk");
const dotenv = require('dotenv').config();


const region = process.env.REGION;
const endpoint = process.env.ENDPOINT;


AWS.config.update({
  region,
  endpoint
});

class DynamoDBInstance {
  constructor() {
    this.dynamodb = new AWS.DynamoDB.DocumentClient();
  }
}

try {
  module.exports = new DynamoDBInstance();
} catch (error) {
  console.error("Error occurred during DynamoDB instance creation:", error);
  process.exit(1); 
}
