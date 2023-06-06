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
      TableName: 'ParkingLevel',
      KeySchema: [
        { AttributeName: 'lotId', KeyType: 'HASH' },
        { AttributeName: 'LevelNo', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'lotId', AttributeType: 'S' },
        { AttributeName: 'LevelNo', AttributeType: 'N' }
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
