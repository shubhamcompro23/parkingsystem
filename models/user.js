const dynamodbInstance = require('../db');


async function createUserTable() {
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

module.exports = {
    createUserTable
}
