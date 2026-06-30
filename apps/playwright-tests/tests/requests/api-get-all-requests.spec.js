const { test, expect } = require('../../fixtures/requestFixtures');

test('@api API lista Requests com sucesso', async ({ requestApi }) => {
  const allRequests = await requestApi.getAllRequests();

  expect(Array.isArray(allRequests)).toBeTruthy();

  for (const request of allRequests) {
    expect(request).toHaveProperty('Id');
    expect(request).toHaveProperty('Title');
    expect(request).toHaveProperty('Description');
    expect(request).toHaveProperty('Status');
    expect(request).toHaveProperty('Priority');
  }
});