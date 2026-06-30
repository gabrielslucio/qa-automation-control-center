const { test, expect } = require('../../fixtures/requestFixtures');
const { buildRequestData } = require('../../test-data/requestData');

test('@api API devolve uma Request pelo ID', async ({ requestApi }) => {
  const data = buildRequestData();
  let createdRequest;
  let requestById;

  await test.step('Criar Request via API', async () => {
    const result = await requestApi.createRequest(data);

    expect(result.success).toBeTruthy();
    expect(result.status).toBe(200);
  });

  await test.step('Encontrar Request criada na lista', async () => {
    const allRequests = await requestApi.getAllRequests();

    createdRequest = allRequests.find(
      request => request.Title === data.Title
    );

    expect(createdRequest).toBeTruthy();
    expect(createdRequest.Id).toBeTruthy();
  });

  await test.step('Buscar Request pelo Id', async () => {
    requestById = await requestApi.getRequestById(createdRequest.Id);

    expect(requestById).toBeTruthy();
    expect(requestById.Id).toBe(createdRequest.Id);
  });

  await test.step('Validar informação da Request', async () => {
    expect(requestById.Title).toBe(data.Title);
    expect(requestById.Description).toBe(data.Description);
    expect(requestById.Status).toBe(data.Status);
    expect(requestById.Priority).toBe(data.Priority);
  });
});