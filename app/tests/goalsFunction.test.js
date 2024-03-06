const request = require('supertest');
const { handler, GoalsApp } = require('../goalsFunction');

describe('Goals API Tests', () => {
  afterAll(async () => {
  });

  test('POST /goals/:userId creates a new goal for a user', async () => {
    const userId = 'exampleUserId';
    const newGoal = { title: 'Run 5 miles', description: 'Run 5 miles every day' };
    const response = await request(GoalsApp).post(`/goals/${userId}`).send(newGoal);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('goalId');
  });

  test('GET /goals returns a list of goals', async () => {
    const response = await request(GoalsApp).get('/goals');
    expect(response.statusCode).toBe(200);
  });
});
