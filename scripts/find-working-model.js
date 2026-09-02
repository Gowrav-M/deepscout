const fs = require("fs");
const path = require("path");

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

async function testAllModels() {
  const key = process.env.NVIDIA_API_KEY_1;
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await res.json();
  const allIds = data.data.map(m => m.id);
  console.log("ALL AVAILABLE MODEL IDS ON NVIDIA API:");
  console.log(JSON.stringify(allIds, null, 2));

  for (const model of allIds) {
    try {
      const testRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 5,
        }),
      });

      if (testRes.ok) {
        const testData = await testRes.json();
        console.log(`\n🎉🎉 FOUND FULLY ACCESSIBLE WORKING MODEL: ${model}`);
        console.log(`Response: ${JSON.stringify(testData)}`);
        break;
      }
    } catch (e) {
      // Continue
    }
  }
}

testAllModels();
