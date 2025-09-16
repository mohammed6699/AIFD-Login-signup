global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, message: 'Database connection successful', test: 'test' }),
    status: 200,
  })
);

describe('Test DB API', () => {
  it('should return a successful response from the test-db endpoint', async () => {
    const res = await fetch('/api/test-db');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Database connection successful');
    expect(data.test).toBeDefined();
  });
});
