import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: "AIzaSyAO-_-awWYo5c9sEXUNle3VPg_S9rWPWZg" });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: 'hello',
    });
    console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
test();
