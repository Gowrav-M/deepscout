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

async function listModels() {
  const key = process.env.NVIDIA_API_KEY_1;
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await res.json();
  console.log("Status:", res.status);
  if (data.data) {
    console.log("Total models available:", data.data.length);
    const chatModels = data.data
      .map(m => m.id)
      .filter(id => id.includes("llama") || id.includes("mistral") || id.includes("deepseek") || id.includes("nemotron") || id.includes("qwen"));
    console.log("Sample active chat models:", chatModels.slice(0, 20));
  } else {
    console.log("Response:", data);
  }
}

listModels();
