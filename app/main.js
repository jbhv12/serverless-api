if (process.env.STAGE === 'local') {
    const { UserApp } = require('./usersFunction.js');
    const { GoalsApp } = require('./goalsFunction.js');
    const { WorkoutsApp } = require('./workoutsFunction.js');
    const { DocsApp } = require('./docsFunction.js');

    const AWS = require('aws-sdk');
    AWS.config.update({ region: 'us-west-2' });
    let dynamoDb = new AWS.DynamoDB.DocumentClient();


    dynamoDb = new AWS.DynamoDB.DocumentClient({ endpoint: 'http://dynamodb-local:8000' });    
    UserApp.listen(3001, () => {
        console.log(`Server is running on port 3001`);
    });
    GoalsApp.listen(3002, () => {
        console.log(`Server is running on port 3002`);
    });
    WorkoutsApp.listen(3003, () => {
        console.log(`Server is running on port 3003`);
    });
    DocsApp.listen(3004, () => {
        console.log(`Server is running on port 3004`);
    });
}
