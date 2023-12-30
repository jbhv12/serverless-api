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

const GOALS_TABLE = process.env.GOALS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

app.use('/goals-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('docs/goals-func-docs.yaml')));

app.post('/goals/:userId', (req, res) => {
    const userId = req.params.userId;

    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: userId,
        },
    };

    dynamoDb.get(params, (error, result) => {
        console.log(userId, params, error, result, USERS_TABLE)
        console.log('result', result);
        if (error) {
            res.status(400).json({ error: 'Could not get user' });
        } else if (result && result.Item) {
            const goalId = uuidv4();
            const goalParams = {
                TableName: GOALS_TABLE,
                Item: {
                    userId: userId,
                    goalId: goalId,
                    ...req.body,
                },
            };

            dynamoDb.put(goalParams, (error) => {
                if (error) {
                    res.status(500).json({ error: 'Could not create goal' });
                } else {
                    res.json({ goalId: goalId });
                }
            });
        } else {
            res.status(404).json({ error: "User does not exist" });
        }
    });
});

app.get('/goals', (req, res) => {
    const userId = req.query.userId;

    if (userId) {
        const params = {
            TableName: USERS_TABLE,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };

        dynamoDb.query(params, (error, result) => {
            if (error) {
                res.status(400).json({ error: 'Error fetching goals for user' });
            } else {
                res.json(result.Items);
            }
        });
    } else {
        const params = {
            TableName: GOALS_TABLE
        };

        dynamoDb.scan(params, (error, result) => {
            if (error) {
                res.status(400).json({ error: 'Error fetching goals' });
            } else {
                res.json(result.Items);
            }
        });
    }
});

app.get('/goals/:goalId', (req, res) => {
    const goalId = req.params.goalId;

    const params = {
        TableName: GOALS_TABLE,
        Key: {
            goalId: goalId,
        },
    };

    dynamoDb.get(params, (error, result) => {
        console.log(error, result, goalId, GOALS_TABLE);
        if (error) {
            res.status(400).json({ error: 'Error retrieving goal' });
        } else if (result.Item) {
            res.json(result.Item);
        } else {
            res.status(404).json({ error: 'Goal not found' });
        }
    });
});

app.put('/goals/:goalId', (req, res) => {
    const goalId = req.params.goalId;
    const body = req.body;

    const params = {
        TableName: GOALS_TABLE,
        Key: {
            goalId: goalId,
        },
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
        UpdateExpression: 'SET',
        ReturnValues: 'UPDATED_NEW',
    };

    Object.keys(body).forEach((key) => {
        params.ExpressionAttributeNames[`#${key}`] = key;
        params.ExpressionAttributeValues[`:${key}`] = body[key];
        params.UpdateExpression += ` #${key} = :${key},`;
    });

    params.UpdateExpression = params.UpdateExpression.slice(0, -1); // Remove trailing comma

    dynamoDb.update(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'Error updating goal' });
        } else {
            res.json(result.Attributes);
        }
    });
});

app.delete('/goals/:goalId', (req, res) => {
    const goalId = req.params.goalId;

    const params = {
        TableName: GOALS_TABLE,
        Key: {
            goalId: goalId,
        },
    };

    dynamoDb.delete(params, (error) => {
        if (error) {
            res.status(400).json({ error: 'Error deleting goal' });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = { handler: serverless(app), GoalsApp: app };