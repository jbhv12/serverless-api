const request = require('supertest');
const { handler, UserApp } = require('../src/usersFunction');

describe('User API Tests', () => {
  afterAll(async () => {
  });

  test('POST /users creates a new user', async () => {
    const newUser = { name: 'John Doe', email: 'john@example.com' };
    const response = await request(UserApp).post('/users').send(newUser);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('userId');
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
  });

  test('GET /users returns a list of users', async () => {
    const response = await request(UserApp).get('/users');
    expect(response.statusCode).toBe(200);
  });
});
