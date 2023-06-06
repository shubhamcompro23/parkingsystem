const AWS = require("aws-sdk");
const dotenv =  require("dotenv").config()


const region = process.env.REGION;
const endpoint = process.env.ENDPOINT;

AWS.config.update({
    region,
    endpoint
})

const dynamodb = new AWS.DynamoDB()


async function parkingLot() {
  try {
    const params = {
      TableName: 'Vehicle',
      KeySchema: [
        { AttributeName: 'lotId', KeyType: 'HASH' },
        { AttributeName: 'vehicleNumber', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'lotId', AttributeType: 'S' },
        { AttributeName: 'vehicleNumber', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5 
      }
    };

    const response = await dynamodb.createTable(params).promise();
    console.log('Table created successfully:', response);
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

parkingLot()
