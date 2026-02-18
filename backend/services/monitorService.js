const { ethers } = require("ethers");
const { analyzeRisk } = require("./aiService");

// BNB Chain RPC (Public Endpoint)
const BSC_RPC = "https://bsc-dataseed.binance.org/";
const provider = new ethers.JsonRpcProvider(BSC_RPC);

let isScanning = false;
let recentScans = [];

const startMonitoring = async (callback) => {
  if (isScanning) return;
  isScanning = true;
  console.log("👀 Started monitoring BNB Chain for new contracts...");

  provider.on("block", async (blockNumber) => {
    try {
      const block = await provider.getBlock(blockNumber, true); // true = include transactions
      if (!block || !block.prefetchedTransactions) return;

      console.log(`📦 Block ${blockNumber} | Txs: ${block.prefetchedTransactions.length}`);

      for (const tx of block.prefetchedTransactions) {
        // Contract Creation Detection: 'to' is null
        if (!tx.to) {
          console.log(`✨ New Contract Detected! Hash: ${tx.hash} From: ${tx.from}`);
          
          const auditResult = await analyzeRisk({
            type: "New Contract Deployment",
            from: tx.from,
            inputData: tx.data.substring(0, 200) + "...", // Sample of bytecode
            hash: tx.hash
          }, "groq");

          const scanData = {
            block: blockNumber,
            hash: tx.hash,
            creator: tx.from,
            riskReport: auditResult,
            timestamp: new Date().toISOString()
          };

          recentScans.unshift(scanData);
          if (recentScans.length > 10) recentScans.pop(); // Keep last 10

          if (callback) callback(scanData);
        }
      }
    } catch (err) {
      console.error("Monitor Error:", err);
    }
  });
};

const getRecentScans = () => recentScans;

module.exports = { startMonitoring, getRecentScans };
