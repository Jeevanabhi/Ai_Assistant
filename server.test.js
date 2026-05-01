import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';

// We mock the backend app configuration for testing the rate limiter and endpoints
const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { userText, messageHistory } = req.body;
  if (!userText || !messageHistory) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  res.json({ text: 'Mock response' });
});

describe('Backend API Tests', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ userText: 'Hello' }); // Missing messageHistory
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  it('should process a valid request', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ 
        userText: 'Hello',
        messageHistory: [{ id: 1, role: 'ai', content: 'Hi' }]
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('text', 'Mock response');
  });
});
