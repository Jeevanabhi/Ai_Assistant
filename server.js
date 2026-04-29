import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Allow requests from any origin during local development to avoid port issues
app.use(cors());
app.use(express.json());

// Initialize the Google Gen AI SDK
// The user currently has VITE_GEMINI_API_KEY in their .env, so we fall back to it
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("FATAL ERROR: No API key found in .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

app.post('/api/chat', async (req, res) => {
  try {
    const { userText, messageHistory, userContext } = req.body;

    if (!userText || !messageHistory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dynamicSystemInstruction = `
You are a Voting Information Assistant for the Election Commission of India (ECI).
Your ONLY source of truth is the information available on https://voters.eci.gov.in/ and official Indian election processes.
You must help users understand the election process, timelines, and steps in an interactive, easy-to-follow, and step-by-step way. Use formatting like bullet points and bold text to make complex processes simple to digest.

IMPORTANT CONTEXT: The user you are currently speaking to has identified their profile as: "${userContext || 'General Voter'}".
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
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    let statusCode = 500;
    if (error.status) statusCode = error.status;
    
    res.status(statusCode).json({ 
      error: error.message || 'Internal Server Error',
      status: statusCode
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
