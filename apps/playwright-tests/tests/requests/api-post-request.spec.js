const { test, expect } = require('../../fixtures/requestFixtures');
const { buildRequestData } = require('../../test-data/requestData');

test('@api API cria Request com sucesso', async ({ requestApi }) => {
  const data = buildRequestData();

  const result = await requestApi.createRequest(data);

  expect(result.success).toBeTruthy();
  expect(result.status).toBe(200);
});
