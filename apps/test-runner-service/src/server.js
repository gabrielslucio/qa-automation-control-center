const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar o .env antes de importar módulos que usam process.env
dotenv.config();

console.log('PLAYWRIGHT_PROJECT_PATH loaded:',
Boolean(process.env.PLAYWRIGHT_PROJECT_PATH));
console.log('RUNNER_API_KEY loaded:', Boolean(process.env.RUNNER_API_KEY));

const {
    startTestRun,
    getTestRun,
    getTestRuns,
} = require('./testRunner');

const app = express();

app.use(cors());
app.use(express.json());

function requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if(!apiKey || apiKey !== process.env.RUNNER_API_KEY) {
        return res.status(401).json({
            message: 'Unauthorized',
        })
    }

    next();
}

app.post('/test-runs', requireApiKey, async(req, res) => {
    try {
        const {grep, project} = req.body || {};

        const run = await startTestRun({
            grep,
            project,
        });

        return res.status(202).json(run);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

app.get('/test-runs', requireApiKey, (req, res) => {
    return res.json(getTestRuns());
});

app.get('/test-runs/:runId', requireApiKey, (req, res) => {
    const run = getTestRun(req.params.runId);

    if(!run) {
        return res.status(404).json({
            message: 'Test run not found',
        });
    }

    return res.json(run);
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`QA Test Runner Service running on port ${port}`);
});