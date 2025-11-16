import request from 'supertest';
import app from './index.js';

test('GET /api/quote devolve frase', async () => {
  const res = await request(app).get('/api/quote');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('content');
  expect(res.body).toHaveProperty('author');
});
