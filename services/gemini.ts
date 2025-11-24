import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are MedCore AI, an advanced medical assistant for hospital staff. 
Your goal is to assist doctors and nurses with:
1. Symptom Triage: Analyze symptoms and suggest a triage level (Green, Yellow, Red) and potential diagnoses.
2. Documentation: Help draft discharge summaries or clinical notes based on raw input.
3. Information: Provide quick references for drug interactions or medical guidelines.

DISCLAIMER: Always start or end strictly medical advice with a disclaimer that you are an AI and this is not a substitute for professional medical judgement.
Keep responses professional, concise, and structured (use lists or bold text for readability).
`;

export const getGeminiResponse = async (prompt: string, model: string = 'gemini-2.5-flash'): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key is missing. Please check your configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 1000,
      }
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
};