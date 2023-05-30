import { TestClient } from './utils/client';
import { useClient, useTransaction } from './utils/service/hooks';

describe('AppController (e2e)', () => {
  let client: TestClient;

  useClient({ beforeAll: (cl) => (client = cl) })
  // useTransaction({ before: 'all', client: () => client })

  it('/ (GET) should return not found error', async () => {
    const res = await client.requestApi('/not-found-router');
    expect(res.error).toBe('Not Found');
    expect(res.statusCode).toBe(404);
  });
});
