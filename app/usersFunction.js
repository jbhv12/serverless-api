const express = require('express');
const AWS = require('aws-sdk');
const serverless = require("serverless-http");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: 'us-west-2' });
let dynamoDb = new AWS.DynamoDB.DocumentClient();
if (process.env.STAGE === 'local') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({ endpoint: 'http://dynamodb-local:8000' });
}
const app = express();
app.use(express.json());

const USERS_TABLE = process.env.USERS_TABLE;
const GOALS_TABLE = process.env.GOALS_TABLE;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(YAML.load('./docs/users-func-docs.yaml')));

app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Request must contain name and email' });
    }
    const userId = uuidv4();
    const params = {
        TableName: USERS_TABLE,
        Item: { userId, name, email },
    };

    try {
        await dynamoDb.put(params).promise();
        res.json({ userId, name, email });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not create user' });
    }
});

app.get('/users', async (req, res) => {
    const params = {
        TableName: USERS_TABLE
    };

    try {
        const data = await dynamoDb.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not retrieve users' });
    }
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: id
        }
    };

    try {
        const data = await dynamoDb.get(params).promise();
        if (data.Item) {
            res.json(data.Item);
        } else {
            res.status(404).json({ error: `User with ID: ${id} not found` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not retrieve user' });
    }
});

app.put('/users/:id', async (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;

    if (!name || !email) {
        return res.status(400).json({ error: 'Request must contain name and email' });
    }

    const params = {
        TableName: USERS_TABLE,
        Key: { userId: id },
        UpdateExpression: 'set #n = :n, #e = :e',
        ExpressionAttributeNames: {
            '#n': 'name',
            '#e': 'email'
        },
        ExpressionAttributeValues: {
            ':n': name,
            ':e': email
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        await dynamoDb.update(params).promise();
        res.json({ userId: id, name, email });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not update user' });
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: id
        }
    };

    try {
        // Check if user exists
        const user = await dynamoDb.get(params).promise();
        if (!user.Item) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await dynamoDb.delete(params).promise();

        // Delete associated goals
        const goalsParams = {
            TableName: GOALS_TABLE,
            Key: {
                userId: id
            }
        };
        await dynamoDb.delete(goalsParams).promise();

        res.json({ success: `User with ID: ${id} and associated goals were deleted` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not delete user and associated goals' });
    }
});


module.exports.handler = serverless(app);
module.exports = { UserApp: app };