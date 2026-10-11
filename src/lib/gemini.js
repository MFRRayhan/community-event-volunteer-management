import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Supported models to try in order of preference.
 * Includes multiple fallback models in case of temporary 503 capacity spikes
 * or regional model deprecations.
 */
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-pro-latest",
  "gemini-2.5-pro",
];

/**
 * Initializes and retrieves the Google Gemini client instance
 * 
 * @returns {import("@google/generative-ai").GoogleGenerativeAI}
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    throw new Error(
      "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file."
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generates structured community event content based on an organizer's idea
 * 
 * @param {string} idea - Short prompt or concept for the community initiative
 * @returns {Promise<{
 *   title: string,
 *   description: string,
 *   suggestedRoles: string[],
 *   requiredSkills: string[],
 *   promotionalMessage: string
 * }>}
 */
export async function generateEventContent(idea) {
  if (!idea || typeof idea !== "string" || !idea.trim()) {
    throw new Error("Please provide a brief idea or theme for the event.");
  }

  const genAI = getGeminiClient();

  const prompt = `
You are an expert community organizer and volunteer coordinator.
An organizer has provided the following idea for a community initiative:
"${idea.trim()}"

Generate a compelling, well-structured event profile.
You MUST return ONLY a valid raw JSON object matching the following structure exactly.
Do NOT enclose the response in markdown blocks like \`\`\`json.
Do NOT include any commentary, explanations, or notes outside the JSON.

Required format:
{
  "title": "Engaging, professional event title",
  "description": "Comprehensive, inspirational event overview covering the mission, what volunteers will do, and community impact (2-3 paragraphs)",
  "suggestedRoles": ["Volunteer Role 1", "Volunteer Role 2", "Volunteer Role 3"],
  "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "promotionalMessage": "Exciting social media broadcast message to attract volunteers (2-3 sentences with emojis)"
}
`;

  let lastError = null;
  let rawText = "";

  // Attempt models with automatic fallback across candidates
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      rawText = response.text();
      if (rawText) break;
    } catch (err) {
      lastError = err;
      // Try next model candidate on 503 (overloaded), 404 (not found), or 429 (rate limit)
      console.warn(`Gemini model ${modelName} encountered error: ${err.message}. Trying next candidate...`);
    }
  }

  if (!rawText) {
    throw (
      lastError ||
      new Error("Failed to generate content: No response received from Gemini AI.")
    );
  }

  // Clean potential markdown blocks
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(cleanJson);
    return {
      title: parsed.title || "Community Initiative",
      description: parsed.description || "",
      suggestedRoles: Array.isArray(parsed.suggestedRoles) ? parsed.suggestedRoles : [],
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
      promotionalMessage: parsed.promotionalMessage || "",
    };
  } catch {
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || "Community Initiative",
        description: parsed.description || "",
        suggestedRoles: Array.isArray(parsed.suggestedRoles) ? parsed.suggestedRoles : [],
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        promotionalMessage: parsed.promotionalMessage || "",
      };
    }
    throw new Error("Failed to parse Gemini response as JSON.");
  }
}
