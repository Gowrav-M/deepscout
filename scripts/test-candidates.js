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

const candidateModels = [
  "mistralai/mistral-large-2-instruct",
  "mistralai/mixtral-8x22b-v0.1",
  "mistralai/mistral-7b-instruct-v0.3",
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama-3.2-90b-vision-instruct",
  "meta/llama2-70b",
  "deepseek-ai/deepseek-v4-flash-0731",
  "mistralai/mistral-nemotron",
  "nv-mistralai/mistral-nemo-12b-instruct"
];

async function findWorkingModel() {
  const key = process.env.NVIDIA_API_KEY_1;
  console.log("Testing candidate models for account...");

  for (const model of candidateModels) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Say hello!" }],
          max_tokens: 10,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ SUCCESS with model: ${model} -> Response: "${data.choices?.[0]?.message?.content?.trim()}"`);
        return model;
      } else {
        const errText = await res.text();
        console.log(`❌ FAILED with model: ${model} (${res.status}): ${errText.slice(0, 100)}`);
      }
    } catch (e) {
      console.log(`❌ ERROR with model: ${model}: ${e.message}`);
    }
  }
}

findWorkingModel();
