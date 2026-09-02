// Live test script for Tavily search and NVIDIA LLM using the configured .env.local
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...v] = trimmed.split("=");
      process.env[k.trim()] = v.join("=").trim();
    }
  }
}

async function testLivePipeline() {
  console.log("=== TESTING LIVE INTEGRATIONS ===");
  console.log("Tavily Key Available:", !!process.env.TAVILY_API_KEY);
  console.log("NVIDIA Key 1 Available:", !!process.env.NVIDIA_API_KEY_1);
  console.log("NVIDIA Model:", process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct");

  // 1. Test Tavily
  console.log("\n[1/3] Testing Tavily Web Search API with topic: 'Future of EV in India'...");
  const tavilyPayload = {
    api_key: process.env.TAVILY_API_KEY,
    query: "Future of EV in India",
    search_depth: "advanced",
    include_raw_content: true,
    max_results: 5,
  };

  const tavilyRes = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tavilyPayload),
  });

  if (!tavilyRes.ok) {
    const errText = await tavilyRes.text();
    throw new Error(`Tavily search failed (${tavilyRes.status}): ${errText}`);
  }

  const tavilyData = await tavilyRes.json();
  console.log(`✅ Tavily search succeeded! Returned ${tavilyData.results?.length || 0} results.`);
  tavilyData.results?.slice(0, 3).forEach((r, idx) => {
    console.log(`   Source ${idx + 1}: ${r.title} (${r.url})`);
  });

  // 2. Test NVIDIA API
  console.log("\n[2/3] Testing NVIDIA API completion...");
  const nvidiaKey = process.env.NVIDIA_API_KEY_1;
  const nvidiaPayload = {
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    messages: [
      { role: "system", content: "You are a research assistant. Provide a 1-sentence summary." },
      { role: "user", content: "What is the key driver of electric vehicle adoption in India?" },
    ],
    max_tokens: 100,
    temperature: 0.2,
  };

  const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nvidiaKey}`,
    },
    body: JSON.stringify(nvidiaPayload),
  });

  if (!nvidiaRes.ok) {
    const errText = await nvidiaRes.text();
    throw new Error(`NVIDIA API call failed (${nvidiaRes.status}): ${errText}`);
  }

  const nvidiaData = await nvidiaRes.json();
  const reply = nvidiaData.choices?.[0]?.message?.content;
  console.log(`✅ NVIDIA API call succeeded! Response:\n"${reply?.trim()}"`);

  console.log("\n[3/3] Live verification successful! All APIs and credentials are operational.");
}

testLivePipeline().catch((err) => {
  console.error("Live test failed:", err);
  process.exit(1);
});
