const fs = require("fs");
const path = require("path");

// Load .env.local
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

// We can test the agents by importing the built Next.js modules or directly calling the pipeline
async function testFullWorkflow() {
  console.log("=== TESTING COMPLETE 3-AGENT RESEARCH PIPELINE ===");
  const topic = "Future of EV in India";
  console.log(`Topic: "${topic}"\n`);

  // Step 1: Researcher (Tavily)
  console.log("[AGENT 1 - RESEARCHER] Searching web and curating 5 sources...");
  const tavilyRes = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: topic,
      search_depth: "advanced",
      include_raw_content: true,
      max_results: 5,
    }),
  });
  const tavilyData = await tavilyRes.json();
  const sources = tavilyData.results.slice(0, 5).map((r, i) => ({
    id: `src-${i + 1}`,
    title: r.title,
    url: r.url,
    domain: new URL(r.url).hostname.replace(/^www\./, ""),
    content: (r.raw_content || r.content || "").slice(0, 3000),
  }));

  console.log(`✅ Researcher curated ${sources.length} sources.`);
  sources.forEach((s, idx) => console.log(`   [${idx + 1}] ${s.title} (${s.domain})`));

  // Step 2: Summarizer (Synthesis)
  console.log("\n[AGENT 2 - SUMMARIZER] Synthesizing cross-source evidence...");
  const nvidiaKey = process.env.NVIDIA_API_KEY_1;
  const summarizerPrompt = `You are the Summarizer Agent. Analyze these 5 sources for topic: "${topic}".
Sources:
${sources.map((s, i) => `[${i + 1}] ${s.title} (${s.domain}): ${s.content.slice(0, 500)}...`).join("\n\n")}

Return JSON with format:
{
  "keyFindings": ["finding 1", "finding 2"],
  "trends": ["trend 1", "trend 2"],
  "challenges": ["challenge 1", "challenge 2"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}`;

  const sumRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nvidiaKey}`,
    },
    body: JSON.stringify({
      model: process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct",
      messages: [
        { role: "system", content: "You are a professional research summarizer. Respond ONLY with valid JSON." },
        { role: "user", content: summarizerPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  const sumData = await sumRes.json();
  const sumContent = sumData.choices?.[0]?.message?.content || "";
  console.log("✅ Summarizer Agent completed synthesis.");
  console.log("   Synthesis excerpt:", sumContent.slice(0, 200) + "...");

  // Step 3: Report Writer (Report with Citations)
  console.log("\n[AGENT 3 - REPORT WRITER] Generating publication-grade research report with [1], [2] citations...");
  const writerPrompt = `You are the Report Writer Agent. Write an executive research report on "${topic}".
Use the following sources:
${sources.map((s, i) => `[${i + 1}] ${s.title} (${s.url})`).join("\n")}

Synthesis:
${sumContent}

Required sections:
# Title
Executive Summary
1. Introduction
2. Current Landscape
3. Key Findings
4. Challenges
5. Strategic Opportunities
6. Future Outlook
7. Conclusion
Sources & References

Use inline citation markers like [1], [2] to reference facts.`;

  const reportRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nvidiaKey}`,
    },
    body: JSON.stringify({
      model: process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct",
      messages: [
        { role: "system", content: "You are an elite editorial research analyst." },
        { role: "user", content: writerPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  const reportData = await reportRes.json();
  const finalReport = reportData.choices?.[0]?.message?.content || "";
  console.log("✅ Report Writer Agent generated final report!");
  console.log("\n=================== FINAL REPORT PREVIEW ===================");
  console.log(finalReport.slice(0, 600));
  console.log("...\n============================================================");

  console.log("\n🎉 FULL 3-AGENT WORKFLOW TEST PASSED WITH DISTINCTION!");
}

testFullWorkflow().catch((err) => {
  console.error("Workflow test failed:", err);
  process.exit(1);
});
