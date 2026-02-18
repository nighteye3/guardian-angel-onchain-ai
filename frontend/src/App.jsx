import React, { useState } from 'react';

function App() {
  const [inputData, setInputData] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('groq');

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: inputData, provider }),
      });
      const result = await response.json();
      setAnalysis(result.result);
    } catch (error) {
      console.error("Error:", error);
      setAnalysis("Error fetching analysis.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header>
        <h1>🛡️ Guardian Angel AI</h1>
        <p>Onchain Security & Risk Analysis Agent</p>
      </header>

      <main>
        <div className="card">
          <h2>Analyze Transaction / Contract</h2>
          <textarea 
            placeholder="Paste transaction data, contract code, or logs here..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            rows={5}
          />
          
          <div className="controls">
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="groq">⚡ Groq (Fast)</option>
              <option value="gemini">🧠 Gemini (Deep)</option>
            </select>
            <button onClick={handleAnalyze} disabled={loading}>
              {loading ? 'Scanning...' : 'Analyze Risk'}
            </button>
          </div>
        </div>

        {analysis && (
          <div className="card result">
            <h2>🔎 AI Analysis Result</h2>
            <div className="markdown-body">
              {analysis.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
