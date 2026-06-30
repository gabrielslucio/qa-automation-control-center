class RequestApi {
  constructor(request) {
    this.request = request;
    this.authHeaders = this.buildAuthHeaders();
  }

  buildAuthHeaders() {
    const authMode = process.env.API_AUTH_MODE || 'basic';

    if (authMode === 'basic') {
      const username = process.env.API_USERNAME;
      const password = process.env.API_PASSWORD;

      if (!username || !password) {
        throw new Error(
          'Basic Authentication credentials are missing. Set API_USERNAME and API_PASSWORD in your .env file.'
        );
      }

      const encodedCredentials = Buffer
        .from(`${username}:${password}`, 'utf8')
        .toString('base64');

      return {
        Authorization: `Basic ${encodedCredentials}`,
      };
    }

    if (authMode === 'bearer') {
      const token = process.env.API_BEARER_TOKEN;

      if (!token) {
        throw new Error(
          'Bearer token is missing. Set API_BEARER_TOKEN in your .env file.'
        );
      }

      return {
        Authorization: `Bearer ${token}`,
      };
    }

    throw new Error(
      `Unsupported API_AUTH_MODE: ${authMode}. Expected "basic" or "bearer".`
    );
  }

  async createRequest(data) {
    const endpoint = 'rest/POST_CreateRequest/CreateRequest';

    if (!data || typeof data !== 'object') {
      throw new Error('CreateRequest failed: payload must be a valid object.');
    }

    if (!data.Title || !data.Description || !data.Status || !data.Priority || !data.CreatedOn) {
      throw new Error(
        'CreateRequest failed: missing required fields. Required: Title, Description, Status, Priority, CreatedOn.'
      );
    }

    const response = await this.request.post(endpoint, {
      data,
      headers: this.authHeaders,
    });

    if (!response.ok()) {
      const errorBody = await response.text();

      throw new Error(
        `CreateRequest failed. Status: ${response.status()} ${response.statusText()}. Body: ${errorBody}`
      );
    }

    return {
      success: true,
      status: response.status(),
      data,
    };
  }

  async getAllRequests() {
    const endpoint = 'rest/GET_RequestInformation/GetAllRequests';

    const response = await this.request.get(endpoint, {
      headers: this.authHeaders,
    });

    const bodyText = await response.text();

    if (!response.ok()) {
      throw new Error(
        `GetAllRequests failed. Status: ${response.status()} ${response.statusText()}. Body: ${bodyText}`
      );
    }

    if (!bodyText || bodyText.trim() === '') {
      return [];
    }

    let parsedBody;

    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      throw new Error(
        `GetAllRequests failed: response body is not valid JSON. Body: ${bodyText}`
      );
    }

    if (Array.isArray(parsedBody)) {
      return parsedBody;
    }

    if (Array.isArray(parsedBody.Requests)) {
      return parsedBody.Requests;
    }

    if (Array.isArray(parsedBody.List)) {
      return parsedBody.List;
    }

    throw new Error(
      `GetAllRequests failed: expected an array but received: ${JSON.stringify(parsedBody)}`
    );
  }

  async getRequestById(id) {
    if (id === undefined || id === null || id === '') {
      throw new Error('GetRequestById failed: id is required.');
    }

    const requestId = Number(id);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      throw new Error(`GetRequestById failed: id must be a positive integer. Received: ${id}`);
    }

    const endpoint = `rest/GET_RequestInformation/GetRequestById/${encodeURIComponent(requestId)}`;

    const response = await this.request.get(endpoint, {
      headers: this.authHeaders,
    });

    const bodyText = await response.text();

    if (!response.ok()) {
      throw new Error(
        `GetRequestById failed. Status: ${response.status()} ${response.statusText()}. Body: ${bodyText}`
      );
    }

    if (!bodyText || bodyText.trim() === '') {
      throw new Error(`GetRequestById failed: empty response body for id ${requestId}.`);
    }

    let parsedBody;

    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      throw new Error(
        `GetRequestById failed: response body is not valid JSON. Body: ${bodyText}`
      );
    }

    const request = parsedBody.Request || parsedBody.Item || parsedBody;

    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      throw new Error(
        `GetRequestById failed: expected a single request object. Received: ${JSON.stringify(parsedBody)}`
      );
    }

    if (!request.Id) {
      throw new Error(
        `GetRequestById failed: response does not contain a valid Id. Response: ${JSON.stringify(request)}`
      );
    }

    return request;
  }
}

module.exports = { RequestApi };