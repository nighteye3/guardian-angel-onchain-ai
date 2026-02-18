const { Groq } = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Core AI Wrappers ---

const analyzeWithGroq = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192", // Optimized for speed and logic
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

// --- Specialized Audit & Security Functions ---

const analyzeRisk = async (data, provider = "groq") => {
  const prompt = `
    🚨 SECURITY ALERT ANALYSIS 🚨
    
    You are an elite blockchain security researcher. Analyze the following data:
    "${JSON.stringify(data)}"

    Task:
    1. Identify immediate security threats (Reentrancy, Rug Pull potential, Phishing).
    2. Assess the 'Vibe' of the contract/transaction (is it imitating a legit project?).
    3. Assign a Risk Score (0-100, where 100 is Critical Danger).
    4. Recommend immediate user action (e.g., "Revoke approvals immediately").

    Format the output as a Markdown report with emojis.
  `;
  
  return provider === "gemini" ? await analyzeWithGemini(prompt) : await analyzeWithGroq(prompt);
};

const auditContract = async (code, provider = "gemini") => {
  const prompt = `
    📜 SMART CONTRACT AUDIT REPORT 📜

    You are a senior solidity auditor. Deeply inspect the following code:
    
    \`\`\`solidity
    ${code}
    \`\`\`

    Perform a line-by-line security review focusing on:
    - Access Control vulnerabilities (who owns the contract?).
    - Logic bombs or hidden backdoors.
    - Financial exploits (overflows, flash loan attacks).
    - Gas optimization suggestions.

    Provide a professional Audit Summary.
  `;

  // Prefer Gemini for deep context audits
  return provider === "groq" ? await analyzeWithGroq(prompt) : await analyzeWithGemini(prompt);
};

const traceFunds = async (transactionData, provider = "groq") => {
  const prompt = `
    🕸️ FUND TRACEBACK & VISUALIZATION DATA 🕸️

    Data: "${JSON.stringify(transactionData)}"

    You are a forensic blockchain analyst.
    1. Reconstruct the flow of funds from the provided transaction data.
    2. Identify if funds are moving to known high-risk entities (Mixers, Exchanges, Blacklisted wallets).
    3. Generate a textual representation of the graph (Source -> Intermediary -> Destination).
    
    Output structured data explaining the path of funds.
  `;

  return provider === "gemini" ? await analyzeWithGemini(prompt) : await analyzeWithGroq(prompt);
};

module.exports = { analyzeRisk, auditContract, traceFunds };
