const { randomUUID } = require('crypto');
const { spawn } = require('child_process');

const {
    saveRun,
    updateRun,
    getRun,
    getAllRuns,
} = require('./runStore');

function redactSensitiveData(value){
    if(!value){
        return value;
    }
    
    return value
        .replace(/Authorization:\s*Basic\s+[A-Za-z0-9+/=._-]+/gi, 'Authorization: Basic [REDACTED]')
        .replace(/Authorization:\s*Bearer\s+[A-Za-z0-9+/=._-]+/gi, 'Authorization: Bearer [REDACTED]');
};

async function startTestRun({grep, project}) {

    const playwrightProjectPath = process.env.PLAYWRIGHT_PROJECT_PATH;

    if(!playwrightProjectPath) {
        throw new Error('PLAYWRIGHT_PROJECT_PATH is not configured.');
    }

    const runId = randomUUID();

    const run = saveRun({
        runId,
        status: 'queued',
        grep: grep || null,
        project: project || 'chromium',
        startedAt: null,
        finishedAt: null,
        durationMs: null,
        exitCode: null,
        stdout: '',
        stderr: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    runPlaywrightInBackground(runId, {grep, project});

    return run;
}

function runPlaywrightInBackground(runId, {grep, project}) {
    const startedAtMs = Date.now();

    updateRun(runId, {
        status: 'running',
        startedAt: new Date().toISOString(),
    });

    const args = ['playwright', 'test', '--workers=1'];

    if(project){
        args.push('--project', project);
    }

    if(grep) {
        args.push('--grep', grep)
    }

    const child = spawn('npx', args, {
        cwd: process.env.PLAYWRIGHT_PROJECT_PATH,
        shell: true,
        env: {
            ...process.env,
        },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => {
        stdout += data.toString();

        updateRun(runId, {
            stdout: redactSensitiveData(stdout),
        });
    });

    child.stderr.on('data', data => {
        stderr += data.toString();

        updateRun(runId, {
            stderr: redactSensitiveData(stderr),
        });
    });

    child.on('close', exitCode => {
        const finishedAtMs = Date.now();

        updateRun(runId, {
            status: exitCode === 0 ? 'passed' : 'failed',
            finishedAt: new Date().toISOString(),
            durationMs: finishedAtMs - startedAtMs,
            exitCode,            
            stdout: redactSensitiveData(stdout),
            stderr: redactSensitiveData(stderr),
        });
    });

    child.on('error', error => {
        updateRun(runId, {
            status: 'error',
            stderr: error.message,
            finishedAt: new Date().toISOString(),
        });
    });
}

function getTestRun(runId) {
    return getRun(runId);
}

function getTestRuns() {
    return getAllRuns();
}

module.exports = {
    startTestRun,
    getTestRun,
    getTestRuns,
};