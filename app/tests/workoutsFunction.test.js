const request = require('supertest');
const { handler, WorkoutsApp } = require('../workoutsFunction');

describe('Workouts API Tests', () => {
  afterAll(async () => {
  });

  test('POST /workouts/:userId creates a new workout for a user', async () => {
    const userId = 'exampleUserId';
    const newWorkout = { exercise: 'Running', duration: '30 minutes' };
    const response = await request(WorkoutsApp).post(`/workouts/${userId}`).send(newWorkout);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('workoutId');
  });

  test('GET /workouts returns a list of workouts', async () => {
    const response = await request(WorkoutsApp).get('/workouts');
    expect(response.statusCode).toBe(200);
  });
});
