import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('monitor'); // monitor, audit, trace, inspect
  const [inputData, setInputData] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('groq');
  const [liveScans, setLiveScans] = useState([]);

  // Poll for live monitor updates
  useEffect(() => {
    if (activeTab === 'monitor') {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/monitor');
          const data = await res.json();
          setLiveScans(data.scans);
        } catch (e) {
          console.error("Monitor poll failed", e);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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
    } else if (activeTab === 'inspect') {
      // Re-use risk analysis endpoint but prompt specifically for address details
      endpoint = '/api/analyze'; 
      body = { data: `Inspect Address History & Visuals for: ${inputData}`, provider };
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
        <p className="subtitle">AI-Powered Onchain Watchdog & Auditor</p>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'monitor' ? 'active' : ''} 
          onClick={() => setActiveTab('monitor')}
        >
          📡 Live Watchdog
        </button>
        <button 
          className={activeTab === 'audit' ? 'active' : ''} 
          onClick={() => { setActiveTab('audit'); setAnalysis(null); }}
        >
          📜 Smart Auditor
        </button>
        <button 
          className={activeTab === 'inspect' ? 'active' : ''} 
          onClick={() => { setActiveTab('inspect'); setAnalysis(null); }}
        >
          🔍 Address Inspector
        </button>
        <button 
          className={activeTab === 'trace' ? 'active' : ''} 
          onClick={() => { setActiveTab('trace'); setAnalysis(null); }}
        >
          🕸️ Fund Traceback
        </button>
      </nav>

      <main>
        {activeTab === 'monitor' ? (
          <div className="card monitor-feed">
            <div className="card-header">
              <h2>📡 Real-Time BNB Chain Contract Scanner</h2>
              <span className="live-indicator">● LIVE</span>
            </div>
            {liveScans.length === 0 ? (
              <p className="placeholder-text">Waiting for new contracts on BNB Chain...</p>
            ) : (
              <div className="feed-list">
                {liveScans.map((scan, idx) => (
                  <div key={idx} className="feed-item">
                    <div className="feed-header">
                      <span className="hash">{scan.hash.substring(0, 10)}...</span>
                      <span className="time">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="feed-report markdown-body">
                      {scan.riskReport.split('\n').slice(0, 3).map(l => <div key={l}>{l}</div>)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h2>
                {activeTab === 'audit' && "Paste Solidity Code for Audit"}
                {activeTab === 'inspect' && "Enter Wallet Address to Visualize"}
                {activeTab === 'trace' && "Paste Transaction Hash / Logs for Traceback"}
              </h2>
            </div>
            
            <textarea 
              placeholder={
                activeTab === 'audit' ? "// Paste Solidity code here..." :
                activeTab === 'inspect' ? "0x..." :
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
                  activeTab === 'audit' ? '🛡️ Start Audit' :
                  activeTab === 'inspect' ? '🔎 Inspect' :
                  '🕸️ Trace Funds'
                }
              </button>
            </div>
          </div>
        )}

        {analysis && activeTab !== 'monitor' && (
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
