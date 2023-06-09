const AWS = require("aws-sdk");
const dotenv =  require("dotenv").config()


const region = process.env.REGION;
const endpoint = process.env.ENDPOINT;

AWS.config.update({
    region,
    endpoint
})

const dynamodb = new AWS.DynamoDB()


async function user() {
  try {
    const params = {
      TableName: 'User',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5 
      }
    };

    const response = await dynamodbInstance.dynamodb.createTable(params).promise();
    console.log('Table created successfully:', response);
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

user()
