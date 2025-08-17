
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_PROMPT_TEMPLATE } from '../constants';
import type { ApiResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        narration_ssml: { type: Type.STRING },
        voice_hint: {
            type: Type.OBJECT,
            properties: {
                language: { type: Type.STRING },
                style: { type: Type.STRING },
                rate: { type: Type.NUMBER },
                pitch: { type: Type.NUMBER },
            },
            required: ['language', 'style', 'rate', 'pitch']
        },
        scenes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    duration_ms: { type: Type.INTEGER },
                    agent_action: { type: Type.STRING },
                    agent_position: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                        },
                        required: ['x', 'y']
                    },
                    symbol_art: { type: Type.STRING, nullable: true },
                    symbol_position: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                        },
                        required: ['x', 'y'],
                        nullable: true
                    },
                    caption: { type: Type.STRING, nullable: true },
                },
                required: ['duration_ms', 'agent_action', 'agent_position']
            }
        }
    },
    required: ['narration_ssml', 'voice_hint', 'scenes']
};

export async function fetchExplanation(question: string): Promise<ApiResponse> {
  const prompt = GEMINI_PROMPT_TEMPLATE.replace('<INSERT USER QUESTION HERE>', question);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    // Basic validation to ensure the parsed object matches the expected structure
    if (!parsed.narration_ssml || !parsed.scenes) {
        throw new Error("Invalid response structure from API.");
    }

    return parsed as ApiResponse;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get explanation: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching the explanation.");
  }
}
