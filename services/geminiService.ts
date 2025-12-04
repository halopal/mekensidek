
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Deck, FileInput } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Prompt Constants
const CONSULTANT_SYSTEM_INSTRUCTION = `
You are a Senior Engagement Manager at a top-tier management consulting firm (McKinsey, BCG, Bain). 
Your task is to synthesize raw information into a high-impact, executive-level presentation deck.

Adhere strictly to these principles:
1. Pyramid Principle: Start with the answer/recommendation. Group supporting arguments below.
2. MECE: Ensure points are Mutually Exclusive and Collectively Exhaustive.
3. Action Titles: Every slide MUST have a full-sentence headline that explicitly states the insight (e.g., "Revenue grew 20% due to X", not "Revenue Update").
4. Data-Driven: Prioritize quantitative evidence over qualitative fluff.
`;

// Schema definition for structured JSON output
const DECK_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Main deck title" },
    subtitle: { type: Type.STRING, description: "Deck subtitle/context" },
    author: { type: Type.STRING, description: "Presenter name/role" },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          layout: { 
            type: Type.STRING, 
            enum: [
              "TITLE", 
              "BULLET_POINTS", 
              "TWO_COLUMN", 
              "CHART_BAR", 
              "CHART_LINE", 
              "KPI_GRID"
            ] 
          },
          tracker: { type: Type.STRING, description: "Section name for breadcrumbs" },
          kicker: { type: Type.STRING, description: "Small context label above title (e.g., 'MARKET ANALYSIS')" },
          actionTitle: { type: Type.STRING, description: "Full sentence executive summary of the slide" },
          speakerNotes: { type: Type.STRING },
          content: {
            type: Type.OBJECT,
            properties: {
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              leftColumn: { type: Type.ARRAY, items: { type: Type.STRING } },
              rightColumn: { type: Type.ARRAY, items: { type: Type.STRING } },
              chartTitle: { type: Type.STRING },
              chartXLabel: { type: Type.STRING },
              chartYLabel: { type: Type.STRING },
              chartData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    value2: { type: Type.NUMBER }
                  }
                }
              },
              kpiData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    delta: { type: Type.STRING }
                  }
                }
              }
            }
          }
        },
        required: ["layout", "actionTitle", "tracker", "kicker"]
      }
    }
  },
  required: ["title", "slides"]
};

export const generateDeck = async (
  files: FileInput[],
  userPrompt: string
): Promise<Deck> => {
  const ai = getClient();
  
  // Prepare content parts
  const parts: any[] = [];
  
  // Add files
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.type,
        data: file.data
      }
    });
  });

  // Add text prompt
  const finalPrompt = `
    Analyze the attached documents and the user's specific request: "${userPrompt}".
    
    Create a 5-8 slide storyboard structure.
    For each slide:
    1. Determine the best visual layout (List, Columns, Chart, KPI).
    2. Write a McKinsey-style Action Title.
    3. Extract real data for charts if available in the source, otherwise estimate plausible data based on context and label it as indicative.
  `;
  
  parts.push({ text: finalPrompt });

  try {
    // Using Gemini 2.5 Flash for speed and structured output support
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: CONSULTANT_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual consistency
        responseMimeType: "application/json",
        responseSchema: DECK_SCHEMA
      }
    });

    if (!response.text) {
      throw new Error("No response generated");
    }

    // Since we use responseMimeType: application/json, the text is guaranteed to be valid JSON
    const deckData = JSON.parse(response.text) as Deck;
    return deckData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate deck. Please check your inputs and try again.");
  }
};

export const generateInfographic = async (
  files: FileInput[],
  userPrompt: string
): Promise<string> => {
  // Step 1: Synthesize a visual description prompt using the text model
  const aiText = getClient();
  
  const synthesisParts: any[] = [];
  files.forEach(file => {
    synthesisParts.push({
      inlineData: { mimeType: file.type, data: file.data }
    });
  });

  const synthesisPrompt = `
    Based on the attached documents and this request: "${userPrompt}", create a highly detailed image generation prompt for a professional business infographic.
    
    The infographic prompt should:
    1. Describe a clean, flat vector art style suitable for a corporate boardroom.
    2. Specify a color palette of Navy Blue, Slate Grey, and Teal.
    3. Detail the key visual elements (e.g., "A central timeline showing growth," "A bar chart on the left comparing Q1 vs Q2").
    4. Be descriptive enough for an image generation model to create a coherent visual summary.
    5. Do not include markdown or explanations, just the raw prompt text for the image generator.
  `;
  
  synthesisParts.push({ text: synthesisPrompt });

  const textResponse = await aiText.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: synthesisParts },
  });

  const imagePrompt = textResponse.text || "A professional corporate infographic showing key business metrics in navy and teal.";
  console.log("Generated Image Prompt:", imagePrompt);

  // Step 2: Generate the image using Nano Banana (gemini-2.5-flash-image)
  const aiImage = getClient(); 

  const imageResponse = await aiImage.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: imagePrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        // imageSize is NOT supported in Flash Image (Nano Banana), only in Pro.
      }
    }
  });

  // Extract image
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate infographic image.");
};
