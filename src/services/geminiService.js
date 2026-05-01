/**
 * Generates an AI response from the Gemini API backend.
 * @param {string} userText - The current message from the user.
 * @param {Array<Object>} messageHistory - The chat history.
 * @param {string} userContext - The selected voter profile context.
 * @returns {Promise<{text: string, error: Error|null}>} An object containing the text response or error.
 */
export const generateAIResponse = async (userText, messageHistory, userContext = 'General Voter') => {
  try {
    const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userText,
        messageHistory,
        userContext,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch from backend');
    }

    return { text: data.text, error: null };
  } catch (error) {
    console.error("Error calling backend API:", error);
    let errorMessage = "I'm sorry, I am having trouble connecting right now. Please check [voters.eci.gov.in](https://voters.eci.gov.in/).";
    
    if (error.message.includes("503")) {
        errorMessage = "The AI model is currently experiencing high demand (503 Service Unavailable). Please wait a moment and try again.";
    } else if (error.message.includes("429")) {
        errorMessage = "The API Key has exceeded its usage quota (429 Resource Exhausted). Please check your Google AI Studio billing/plan.";
    } else if (error.message.includes("403")) {
        errorMessage = "Your API Key has been disabled because it was leaked publicly (403 Permission Denied). Please generate a new key in Google AI Studio and update your .env file.";
    } else if (error.message.includes("404")) {
        errorMessage = "The AI model specified was not found (404).";
    }
    
    return { text: errorMessage, error };
  }
};
