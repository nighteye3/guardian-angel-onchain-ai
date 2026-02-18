import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('risk'); // risk, audit, trace
  const [inputData, setInputData] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('groq');

  const handleAction = async () => {
    setLoading(true);
    setAnalysis(null);
    
    let endpoint = '/api/analyze';
    let body = { data: inputData, provider };

    if (activeTab === 'audit') {
      endpoint = '/api/audit';
      body = { code: inputData, provider };
    } else if (activeTab === 'trace') {
      endpoint = '/api/trace';
      body = { transactionData: inputData, provider };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      setAnalysis(result.result);
    } catch (error) {
      console.error("Error:", error);
      setAnalysis("Error fetching analysis. Check backend connection.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header>
        <h1>🛡️ Guardian Angel</h1>
        <p className="subtitle">AI-Powered Onchain Security Suite</p>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'risk' ? 'active' : ''} 
          onClick={() => { setActiveTab('risk'); setAnalysis(null); }}
        >
          🚨 Risk Scanner
        </button>
        <button 
          className={activeTab === 'audit' ? 'active' : ''} 
          onClick={() => { setActiveTab('audit'); setAnalysis(null); }}
        >
          📜 Smart Auditor
        </button>
        <button 
          className={activeTab === 'trace' ? 'active' : ''} 
          onClick={() => { setActiveTab('trace'); setAnalysis(null); }}
        >
          🕸️ Fund Traceback
        </button>
      </nav>

      <main>
        <div className="card">
          <div className="card-header">
            <h2>
              {activeTab === 'risk' && "Scan Transaction / Contract for Risks"}
              {activeTab === 'audit' && "Paste Solidity Code for Audit"}
              {activeTab === 'trace' && "Paste Transaction Hash / Logs for Traceback"}
            </h2>
          </div>
          
          <textarea 
            placeholder={
              activeTab === 'risk' ? "Paste tx hash, logs, or text..." :
              activeTab === 'audit' ? "// Paste Solidity code here..." :
              "Paste transaction JSON or logs..."
            }
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            rows={8}
          />
          
          <div className="controls">
            <div className="provider-select">
              <label>AI Model:</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="groq">⚡ Groq (Llama 3) - Fast</option>
                <option value="gemini">🧠 Gemini Pro - Deep Logic</option>
              </select>
            </div>
            
            <button onClick={handleAction} disabled={loading || !inputData} className="action-btn">
              {loading ? 'Processing...' : 
                activeTab === 'risk' ? '🔍 Scan Risk' :
                activeTab === 'audit' ? '🛡️ Start Audit' :
                '🕸️ Trace Funds'
              }
            </button>
          </div>
        </div>

        {analysis && (
          <div className="card result">
            <div className="result-header">
              <h2>Analysis Report</h2>
              <span className="badge">AI Generated</span>
            </div>
            <div className="markdown-body">
              {analysis.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
