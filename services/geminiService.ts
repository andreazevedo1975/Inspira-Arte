
import { GoogleGenAI, Type } from "@google/genai";
import type { QuoteAndPrompt, VisualIdentityPayload } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImagePromptFromTheme = async (theme: string): Promise<string> => {
    const systemInstruction = `Your task is to create a detailed, high-quality image prompt in ENGLISH based on a single theme word or phrase provided in Portuguese. The prompt should be for an advanced AI image generator (like Imagen).
It must include:
- A central concept that metaphorically represents the theme.
- A specific visual style (e.g., Photography, Digital Painting, Watercolor, Cinematic).
- A color palette that matches the theme's mood.
- Instructions to include a short, inspirational phrase related to the theme, artistically integrated into the image. The phrase must be in PORTUGUESE.
- Quality keywords like "ultra detailed, 8k, volumetric lighting, cinematic lighting, photorealistic".
Return ONLY the prompt text, without any other explanation or markdown.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Theme: ${theme}`,
        config: { systemInstruction, temperature: 0.8 }
    });
    return response.text.trim();
};

export const generateQuoteFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const systemInstruction = `You are a poet and philosopher. Analyze the provided image and write a single, short, profound, and inspiring quote in PORTUGUESE that captures the essence of the image. The quote should be concise and impactful, suitable for being overlaid on the image. Return ONLY the quote text, without quotation marks or any other explanation.`;
    
    const imagePart = {
      inlineData: { data: base64Image, mimeType: mimeType },
    };
    const textPart = { text: "Escreva uma frase para esta imagem." };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: { systemInstruction, temperature: 0.7 }
    });
    return response.text.trim();
};


export const generateImage = async (prompt: string, aspectRatio: string = '16:9'): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    } else {
        throw new Error("Nenhuma imagem foi gerada.");
    }
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    throw new Error("Não foi possível gerar a imagem.");
  }
};

export const generateImageVariations = async (prompt: string, aspectRatio: string = '1:1'): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 3, // Request 3 variations
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else {
        throw new Error("Nenhuma variação foi gerada.");
    }
  } catch (error) {
    console.error("Erro ao gerar variações:", error);
    throw new Error("Não foi possível gerar variações.");
  }
};

export const generateVisualIdentity = async (base64Image: string, mimeType: string, description: string): Promise<VisualIdentityPayload> => {
    const systemInstruction = `You are a world-class branding and design expert. Your task is to analyze an uploaded image and a project description to create a cohesive visual identity.
    Based on the user's image and description, you must generate:
    1.  **Brand Name:** A creative and fitting name for the project/business.
    2.  **Slogan:** A short, memorable tagline.
    3.  **Color Palette:** Extract a primary, a secondary, and an accent color from the image. Provide them as HEX codes.
    4.  **Mascot Prompt:** A detailed, high-quality prompt in ENGLISH for an image generation model. CRITICALLY, you must first identify the artistic style of the uploaded image (e.g., 'photorealistic', 'watercolor painting', 'pixel art', 'line art'). The mascot prompt you create MUST use this same artistic style to ensure visual consistency. The mascot should be cute, appealing, and its colors should align with the generated color palette. Include quality keywords like "centered, high resolution, 4k".
  
    You MUST return the response in the specified JSON format.`;
  
    const visualIdentitySchema = {
      type: Type.OBJECT,
      properties: {
        brandName: { type: Type.STRING, description: "A creative brand name." },
        slogan: { type: Type.STRING, description: "A memorable slogan or tagline." },
        colorPalette: {
          type: Type.OBJECT,
          properties: {
            primary: { type: Type.STRING, description: "Primary color HEX code (e.g., '#FFFFFF')." },
            secondary: { type: Type.STRING, description: "Secondary color HEX code." },
            accent: { type: Type.STRING, description: "Accent color HEX code." },
          },
          required: ['primary', 'secondary', 'accent']
        },
        mascotPrompt: { type: Type.STRING, description: "A detailed prompt in English to generate a mascot image." }
      },
      required: ['brandName', 'slogan', 'colorPalette', 'mascotPrompt']
    };
    
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };
  
    const textPart = {
      text: `Project Description: ${description}`,
    };
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: visualIdentitySchema,
          temperature: 0.7
        }
      });
  
      const jsonText = response.text.trim();
      const parsed = JSON.parse(jsonText);
  
      if (parsed.brandName && parsed.slogan && parsed.colorPalette && parsed.mascotPrompt) {
        return parsed as VisualIdentityPayload;
      } else {
        throw new Error("Invalid response format from API for visual identity.");
      }
  
    } catch (error) {
      console.error("Error generating visual identity:", error);
      throw new Error("Failed to generate visual identity.");
    }
  };
