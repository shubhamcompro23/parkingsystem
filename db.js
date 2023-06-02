const AWS = require("aws-sdk");
const dotenv = require('dotenv').config();

if (dotenv.error) {
  throw dotenv.error;
}

const region = process.env.REGION;
const endpoint = process.env.ENDPOINT;


AWS.config.update({
  region,
  endpoint
});

class DynamoDBInstance {
  constructor() {
    this.dynamodb = new AWS.DynamoDB();
  }
}

try {
  module.exports = new DynamoDBInstance();
} catch (error) {
  console.error("Error occurred during DynamoDB instance creation:", error);
  process.exit(1); 
}
