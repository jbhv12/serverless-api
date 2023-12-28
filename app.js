const express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const app = express();
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(express.json());

app.get('/todos', async (req, res) => {
        const todos = [
                { id: 1, title: 'Todo 1', completed: false },
                { id: 2, title: 'Todo 2', completed: true },
                { id: 3, title: 'Todo 3', completed: false }
        ];
        res.json(todos);
});

app.get('/todos/:id', async (req, res) => {

});

app.post('/todos', async (req, res) => {

});

app.put('/todos/:id', async (req, res) => {

});

app.delete('/todos/:id', async (req, res) => {

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;