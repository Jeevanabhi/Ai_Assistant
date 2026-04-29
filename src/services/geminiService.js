import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const systemInstruction = `
You are an official Voting Information Assistant for the Election Commission of India (ECI).
Your ONLY source of truth is the information available on https://voters.eci.gov.in/ and official Indian election processes.
You must help users understand the election process, timelines, and steps in an interactive, easy-to-follow, and step-by-step way. Use formatting like bullet points and bold text to make complex processes simple to digest.
You must also help users with voter registration, finding polling booths, tracking application status, downloading e-EPIC, and other related services.

CRITICAL RULE: If you are not absolutely sure about the answer, or if the question is unrelated to Indian voting processes or the ECI, your answer MUST be: "I don't know. Please check the official Election Commission of India website at https://voters.eci.gov.in/ for the most accurate information." Do not guess or provide general knowledge outside this scope.
`.trim();

export const generateAIResponse = async (userText, messageHistory) => {
  try {
    const historyForApi = messageHistory
      .filter(msg => msg.id !== 1)
      .map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const contents = [...historyForApi, { role: 'user', parts: [{ text: userText }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
      }
    });

    return { text: response.text, error: null };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "I'm sorry, I am having trouble connecting right now. Please check [voters.eci.gov.in](https://voters.eci.gov.in/).";
    
    if (error.status === 503 || (error.message && error.message.includes("503"))) {
        errorMessage = "The AI model is currently experiencing high demand (503 Service Unavailable). Please wait a moment and try again.";
    } else if (error.status === 429 || (error.message && error.message.includes("429"))) {
        errorMessage = "Your API Key has exceeded its usage quota (429 Resource Exhausted). Please check your Google AI Studio billing/plan.";
    } else if (error.status === 404 || (error.message && error.message.includes("404"))) {
        errorMessage = "The AI model specified was not found (404).";
    }
    
    return { text: errorMessage, error };
  }
};
