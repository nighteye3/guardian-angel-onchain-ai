const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { analyzeRisk, auditContract, traceFunds } = require("./services/aiService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🛡️ Guardian Angel Security Node is Active");
});

// 1. General Risk Analysis
app.post("/analyze", async (req, res) => {
  const { data, provider } = req.body;
  if (!data) return res.status(400).json({ error: "No data provided." });
  
  console.log(`[Risk Analysis] Processing with ${provider || "groq"}...`);
  const result = await analyzeRisk(data, provider);
  res.json({ result });
});

// 2. Smart Contract Audit
app.post("/audit", async (req, res) => {
  const { code, provider } = req.body;
  if (!code) return res.status(400).json({ error: "No contract code provided." });

  console.log(`[Smart Audit] Auditing contract with ${provider || "gemini"}...`);
  const result = await auditContract(code, provider);
  res.json({ result });
});

// 3. Fund Traceback
app.post("/trace", async (req, res) => {
  const { transactionData, provider } = req.body;
  if (!transactionData) return res.status(400).json({ error: "No transaction data provided." });

  console.log(`[Fund Trace] Tracing funds with ${provider || "groq"}...`);
  const result = await traceFunds(transactionData, provider);
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
