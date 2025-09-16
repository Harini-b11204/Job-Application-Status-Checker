const request = require('supertest');
const { app, createApplication, validateEmail, validateName, applications } = require('../index');

describe('Validation helpers', () => {
  test('valid names', () => {
    expect(validateName('Alice Johnson')).toBe(true);
    expect(validateName('Bob')).toBe(true);
    expect(validateName('')).toBe(false);
    expect(validateName('Bob123')).toBe(false);
  });

  test('valid emails', () => {
    expect(validateEmail('alice@mail.com')).toBe(true);
    expect(validateEmail('charlie@company.co')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

describe('API', () => {
  beforeEach(() => {
    // reset in-memory apps
    applications.length = 0;
  });

  test('POST /api/applications rejects bad name', async () => {
    const res = await request(app).post('/api/applications').send({ name: 'Bob123', email: 'bob@mail.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid name/);
  });

  test('POST /api/applications accepts valid', async () => {
    const res = await request(app).post('/api/applications').send({ name: 'Alice', email: 'alice@mail.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('Pending');
  });

  test('POST /api/applications/check updates statuses', async () => {
    await request(app).post('/api/applications').send({ name: 'Alice', email: 'alice@mail.com' });
    const res = await request(app).post('/api/applications/check').send();
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(['Reviewed', 'Selected', 'Rejected']).toContain(res.body[0].status);
  });
});
