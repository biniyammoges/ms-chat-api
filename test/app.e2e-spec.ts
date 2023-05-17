import { TestClient } from './utils/client';
import { setupTestClient } from './utils/setup';

describe('AppController (e2e)', () => {
  let client: TestClient;

  beforeAll(async () => {
    client = await setupTestClient()
  });

  afterAll(async () => {
    await client.close()
  })

  it('/ (GET) should return not found error', async () => {
    const res = await client.requestApi('/not-found-router');
    expect(res.error).toBe('Not Found');
    expect(res.statusCode).toBe(404);
  });
});
