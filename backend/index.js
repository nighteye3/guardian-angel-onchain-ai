const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { analyzeRisk } = require("./services/aiService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Guardian Angel Backend is Running");
});

// Endpoint to analyze a transaction or contract
app.post("/analyze", async (req, res) => {
  const { data, provider } = req.body;
  
  if (!data) {
    return res.status(400).json({ error: "No data provided for analysis." });
  }

  console.log(`Analyzing data using ${provider || "groq"}...`);
  const result = await analyzeRisk(data, provider);
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
