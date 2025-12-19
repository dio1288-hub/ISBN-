
import { GoogleGenAI, Type } from "@google/genai";
import { BookInfo, Language } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchBookByISBN = async (isbn: string, lang: Language): Promise<BookInfo> => {
  const model = "gemini-3-flash-preview";
  
  const langName = lang === 'zh-CN' ? 'Simplified Chinese (简体中文)' : 'Traditional Chinese (繁体中文)';
  
  const prompt = `Search for the book details using ISBN: ${isbn}. 
  Provide the following information in ${langName}:
  1. Author(s)
  2. Book Title
  3. Publisher
  4. Publishing Location (City)
  5. Publishing Year
  
  Return the result EXACTLY as a JSON object with these keys: 
  "author", "title", "publisher", "location", "year". 
  Do not include markdown formatting like \`\`\`json. 
  If a field is unknown, use "未知".`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // We don't use responseMimeType: "application/json" here because 
      // the docs suggest googleSearch works best with text-based responses 
      // and doesn't allow other tools.
    },
  });

  const text = response.text || "";
  // Attempt to parse JSON from the text response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    if (!data) throw new Error("Could not parse book information.");

    const formatted = `${data.author}：《${data.title}》，${data.location}：${data.publisher}，${data.year}`;

    return {
      isbn,
      author: data.author,
      title: data.title,
      publisher: data.publisher,
      location: data.location,
      year: data.year,
      formatted
    };
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw new Error("Unable to retrieve book info. Please check the ISBN.");
  }
};
