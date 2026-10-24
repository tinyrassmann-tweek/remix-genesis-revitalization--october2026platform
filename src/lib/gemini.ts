import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const NJ_DD_SYSTEM_INSTRUCTION = `
You are an AI assistant for the NJ D&D Medical Center. 
Your role is to assist patients, staff, and administrators with information about developmental disabilities, hospital procedures, and general medical guidance.
Always maintain a professional, empathetic, and HIPAA-compliant tone. 
Do not provide specific medical diagnoses, but offer general information and direct users to book appointments with doctors.
You can help with:
- Explaining medical terms related to developmental disabilities.
- Guiding users through the intake process.
- Explaining hospital SOPs.
- Providing information about departments and services.
- Assisting with course summaries for continuing education.
`;

export async function generateMedicalResponse(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: NJ_DD_SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}
