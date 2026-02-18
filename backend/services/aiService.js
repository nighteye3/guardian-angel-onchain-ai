const { Groq } = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeWithGroq = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192", // High performance open model
    });
    return completion.choices[0]?.message?.content || "No response from Groq.";
  } catch (error) {
    console.error("Groq Error:", error);
    return `Error from Groq: ${error.message}`;
  }
};

const analyzeWithGemini = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Error from Gemini: ${error.message}`;
  }
};

// Unified function to call either or both
const analyzeRisk = async (data, provider = "groq") => {
  const prompt = `
    Analyze the following blockchain transaction/contract data for security risks.
    Data: ${JSON.stringify(data)}
    
    Identify:
    1. Potential vulnerabilities (reentrancy, overflow, etc.)
    2. Suspicious patterns (phishing, rug pull signs)
    3. Risk Level (Low/Medium/High/Critical)
    
    Provide a concise summary.
  `;

  if (provider === "gemini") {
    return await analyzeWithGemini(prompt);
  } else {
    return await analyzeWithGroq(prompt);
  }
};

module.exports = { analyzeRisk, analyzeWithGroq, analyzeWithGemini };
