function buildRequestData(overrides = {}) {
    const timestamp = Date.now();

    return {
        Id: 0,
        Title: `E2E_TEST_Request_${timestamp}`,
        Description: 'Created by Playwright automated test',
        Status: 'Submitted',
        Priority: 'Medium',
        CreatedOn: new Date().toISOString(),
        ...overrides,
    };
};

module.exports = { buildRequestData };