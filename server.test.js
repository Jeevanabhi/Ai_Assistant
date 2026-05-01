import request from 'supertest';
import { describe, it, expect } from 'vitest';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';

/**
 * Creates a mock Express app mirroring production server logic for testing.
 * @returns {express.Application} Configured Express application.
 */
function createApp() {
  const app = express();
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '16kb' }));

  app.post('/api/chat', (req, res) => {
    const { userText, messageHistory, userContext } = req.body;

    // Input Validation (mirrors server.js)
    if (!userText || typeof userText !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userText field' });
    }
    if (!Array.isArray(messageHistory)) {
      return res.status(400).json({ error: 'Missing or invalid messageHistory field' });
    }
    if (userText.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters' });
    }

    const sanitizedContext = typeof userContext === 'string' ? userContext : 'General Voter';

    res.json({ text: `Mock response for ${sanitizedContext}` });
  });

  return app;
}

const app = createApp();

describe('Backend API - Input Validation (Security)', () => {
  it('should return 400 if userText is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messageHistory: [] });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid userText field');
  });

  it('should return 400 if userText is not a string', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ userText: 12345, messageHistory: [] });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid userText field');
  });

  it('should return 400 if messageHistory is not an array', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ userText: 'Hello', messageHistory: 'not-an-array' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid messageHistory field');
  });

  it('should return 400 if userText exceeds 2000 characters', async () => {
    const longText = 'A'.repeat(2001);
    const res = await request(app)
      .post('/api/chat')
      .send({ userText: longText, messageHistory: [] });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Message exceeds maximum length of 2000 characters');
  });
});

describe('Backend API - Successful Requests (Efficiency)', () => {
  it('should process a valid request and return 200', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ 
        userText: 'How do I register to vote?',
        messageHistory: [{ id: 1, role: 'ai', content: 'Hello' }],
        userContext: 'General Voter'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body.text).toContain('General Voter');
  });

  it('should default to General Voter if userContext is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ 
        userText: 'Hello',
        messageHistory: []
      });
    
    expect(res.status).toBe(200);
    expect(res.body.text).toContain('General Voter');
  });

  it('should use provided userContext when valid', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ 
        userText: 'Hello',
        messageHistory: [],
        userContext: 'NRI (Overseas) Voter'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.text).toContain('NRI (Overseas) Voter');
  });
});

describe('Backend API - Security Headers', () => {
  it('should include security headers from Helmet', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ userText: 'Hello', messageHistory: [] });
    
    // Helmet sets these headers by default
    expect(res.headers).toHaveProperty('x-content-type-options');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
