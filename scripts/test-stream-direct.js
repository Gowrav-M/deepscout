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

const OpenAI = require("openai");

async function testStream() {
  const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY_1,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  console.log("Starting stream test...");
  try {
    const stream = await client.chat.completions.create({
      model: process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct",
      messages: [
        { role: "system", content: "You are a research analyst." },
        { role: "user", content: "Write a short 2-paragraph analysis of AI in healthcare." },
      ],
      max_tokens: 2048,
      temperature: 0.3,
      stream: true,
    });

    let count = 0;
    for await (const chunk of stream) {
      count++;
      const text = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(text);
    }
    console.log(`\nStream completed successfully with ${count} chunks.`);
  } catch (e) {
    console.error("\nStream error:", e);
  }
}

testStream();
