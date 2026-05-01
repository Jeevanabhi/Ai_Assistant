/**
 * Express backend server for the ECI Voting Assistant.
 * Handles communication with Google Gemini API securely.
 * @module server
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Use Helmet for HTTP security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://voters.eci.gov.in"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compress HTTP responses
app.use(compression());

// Restrict CORS for better security
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '16kb' })); // Limit payload size to prevent abuse

// Apply rate limiting specifically to the API route to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes', status: 429 },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', apiLimiter);

// Serve static files from the Vite build directory with cache headers for efficiency
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
}));

// Initialize the Google Gen AI SDK
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("FATAL ERROR: No API key found in .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// Simple In-Memory Cache for identical queries
const apiCache = new Map();

/**
 * POST /api/chat
 * Accepts user message, chat history, and voter context.
 * Returns AI-generated response from Google Gemini.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { userText, messageHistory, userContext } = req.body;

    // --- Input Validation (Security) ---
    if (!userText || typeof userText !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userText field' });
    }
    if (!Array.isArray(messageHistory)) {
      return res.status(400).json({ error: 'Missing or invalid messageHistory field' });
    }
    // Enforce max input length to prevent prompt injection / abuse
    if (userText.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters' });
    }

    const sanitizedContext = typeof userContext === 'string' ? userContext : 'General Voter';

    // --- Efficiency: Cache Check ---
    const cacheKey = `${sanitizedContext}-${userText.toLowerCase().trim()}`;
    if (apiCache.has(cacheKey)) {
      console.log('Cache HIT:', cacheKey);
      return res.json({ text: apiCache.get(cacheKey) });
    }

    const dynamicSystemInstruction = `
You are a Voting Information Assistant for the Election Commission of India (ECI).
Your ONLY source of truth is the information available on https://voters.eci.gov.in/ and official Indian election processes.
You must help users understand the election process, timelines, and steps in an interactive, easy-to-follow, and step-by-step way. Use formatting like bullet points and bold text to make complex processes simple to digest.

IMPORTANT CONTEXT: The user you are currently speaking to has identified their profile as: "${sanitizedContext}".
You must tailor your advice, forms, and timelines specifically for this profile. For example, if they are an NRI, focus on Form 6A and overseas rules. If they are Senior Citizens/PwD, focus on accessibility and at-home voting if applicable.

CRITICAL RULE: If you are not absolutely sure about the answer, or if the question is unrelated to Indian voting processes or the ECI, your answer MUST be: "I don't know. Please check the official Election Commission of India website at https://voters.eci.gov.in/ for the most accurate information." Do not guess or provide general knowledge outside this scope.
    `.trim();

    const historyForApi = messageHistory
      .filter(msg => msg.id !== 1)
      .map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const contents = [...historyForApi, { role: 'user', parts: [{ text: userText }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.1,
        // Google Services: Safety settings to filter harmful content
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }
    });

    const responseText = response.text;
    
    // Store in cache (limit cache size to 500 to prevent memory leaks)
    if (apiCache.size > 500) {
      const firstKey = apiCache.keys().next().value;
      apiCache.delete(firstKey);
    }
    apiCache.set(cacheKey, responseText);

    res.json({ text: responseText });
  } catch (error) {
    console.error("Error calling Google Gemini API:", error.message);
    
    // --- Google Services: Explicit Error Handling ---
    let statusCode = 500;
    let userMessage = 'An unexpected error occurred. Please try again.';

    if (error.status === 429) {
      statusCode = 429;
      userMessage = 'API quota exceeded (429). The Gemini API rate limit has been reached. Please wait and try again.';
    } else if (error.status === 503) {
      statusCode = 503;
      userMessage = 'The Google Gemini model is temporarily unavailable (503). Please try again shortly.';
    } else if (error.status === 403) {
      statusCode = 403;
      userMessage = 'API key is invalid or has been revoked (403). Please check your GEMINI_API_KEY.';
    } else if (error.status === 404) {
      statusCode = 404;
      userMessage = 'The specified Gemini model was not found (404). Please verify the model name.';
    } else if (error.status) {
      statusCode = error.status;
      userMessage = error.message || 'Internal Server Error';
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      status: statusCode
    });
  }
});

// Catch-all route to serve the React app for non-API requests
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
