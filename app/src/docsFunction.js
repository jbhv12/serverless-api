const express = require('express');
const serverless = require("serverless-http");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

app.get('/', (req, res) => {
    res.redirect('/docs/');
});

const docs = process.env.STAGE === 'local' ? 'docs/openapi.yaml' : 'app/docs/openapi.yaml';
app.use('/docs', swaggerUi.serve, swaggerUi.setup(YAML.load(docs)));

module.exports = { handler: serverless(app), DocsApp: app };
