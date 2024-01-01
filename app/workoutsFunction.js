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

const WORKOUT_LOGS_TABLE = process.env.WORKOUT_LOGS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

app.use('/workouts-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('docs/workouts-func-docs.yaml')));

app.post('/workouts/:userId', (req, res) => {
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
            const workoutId = uuidv4();
            const workoutParams = {
                TableName: WORKOUT_LOGS_TABLE,
                Item: {
                    userId: userId,
                    workoutId: workoutId,
                    ...req.body,
                },
            };

            dynamoDb.put(workoutParams, (error) => {
                if (error) {
                    res.status(500).json({ error: 'Could not create workout' });
                } else {
                    res.json({ workoutId: workoutId });
                }
            });
        } else {
            res.status(404).json({ error: "User does not exist" });
        }
    });
});

app.get('/workouts', (req, res) => {
    const userId = req.query.userId;

    if (userId) {
        const params = {
            TableName: WORKOUT_LOGS_TABLE,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        };

        dynamoDb.scan(params, (error, result) => {
            if (error) {
                res.status(400).json({ error: 'Error fetching workouts for user' });
            } else {
                res.json(result.Items);
            }
        });
    } else {
        const params = {
            TableName: WORKOUT_LOGS_TABLE
        };

        dynamoDb.scan(params, (error, result) => {
            if (error) {
                res.status(400).json({ error: 'Error fetching workouts' });
            } else {
                res.json(result.Items);
            }
        });
    }
});

app.get('/workouts/:workoutId', (req, res) => {
    const workoutId = req.params.workoutId;

    const params = {
        TableName: WORKOUT_LOGS_TABLE,
        Key: {
            workoutId: workoutId,
        },
    };

    dynamoDb.get(params, (error, result) => {
        console.log(error, result, workoutId, WORKOUT_LOGS_TABLE);
        if (error) {
            res.status(400).json({ error: 'Error retrieving workout' });
        } else if (result.Item) {
            res.json(result.Item);
        } else {
            res.status(404).json({ error: 'Workout not found' });
        }
    });
});

app.put('/workouts/:workoutId', (req, res) => {
    const workoutId = req.params.workoutId;
    const body = req.body;

    const params = {
        TableName: WORKOUT_LOGS_TABLE,
        Key: {
            workoutId: workoutId,
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
            res.status(400).json({ error: 'Error updating workout' });
        } else {
            res.json(result.Attributes);
        }
    });
});

app.delete('/workouts/:workoutId', (req, res) => {
    const workoutId = req.params.workoutId;

    const params = {
        TableName: WORKOUT_LOGS_TABLE,
        Key: {
            workoutId: workoutId,
        },
    };

    dynamoDb.delete(params, (error) => {
        if (error) {
            res.status(400).json({ error: 'Error deleting workout' });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = { handler: serverless(app), WorkoutsApp: app };