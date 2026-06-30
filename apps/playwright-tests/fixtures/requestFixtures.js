const base = require('@playwright/test');
const { RequestApi } = require('../api/requestApi');

const test = base.test.extend({
  requestApi: async ({ request }, use) => {
    const api = new RequestApi(request);

    await use(api);
  },
});

const expect = base.expect;

module.exports = { test, expect };
