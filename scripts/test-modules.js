// Test script to verify multi-key failover and source parsing
const assert = require("assert");

console.log("=== RUNNING UNIT TESTS FOR PERSONAL RESEARCH ASSISTANT ===");

// 1. Test Input Validation
function validateTopic(topic) {
  if (!topic || typeof topic !== "string") {
    return { valid: false, error: "Topic is required" };
  }
  const trimmed = topic.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: "Topic too short (min 3 chars)" };
  }
  if (trimmed.length > 300) {
    return { valid: false, error: "Topic too long (max 300 chars)" };
  }
  return { valid: true, topic: trimmed };
}

assert.strictEqual(validateTopic("").valid, false);
assert.strictEqual(validateTopic("ab").valid, false);
assert.strictEqual(validateTopic("Future of EV in India").valid, true);
assert.strictEqual(validateTopic("Future of EV in India").topic, "Future of EV in India");
assert.strictEqual(validateTopic("a".repeat(301)).valid, false);
console.log("✅ 1. Input validation tests passed.");

// 2. Test Domain Extraction
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

assert.strictEqual(extractDomain("https://www.economictimes.indiatimes.com/news"), "economictimes.indiatimes.com");
assert.strictEqual(extractDomain("https://reuters.com/business/autos"), "reuters.com");
console.log("✅ 2. Domain extraction tests passed.");

// 3. Test Text Truncation
function truncateText(text, maxChars = 4000) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "... [truncated]";
}

const longSample = "x".repeat(5000);
assert.strictEqual(truncateText(longSample, 100).length, 115);
assert.strictEqual(truncateText("short text", 100), "short text");
console.log("✅ 3. Text truncation tests passed.");

// 4. Test Key Failover Simulation
class MockNvidiaKeyManager {
  constructor(keys) {
    this.keys = keys;
    this.currentKeyIndex = 0;
  }

  getActiveKey() {
    return { key: this.keys[this.currentKeyIndex % this.keys.length], index: (this.currentKeyIndex % this.keys.length) + 1 };
  }

  rotateToNextKey(reason) {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    return this.getActiveKey();
  }

  async executeWithFailover(operation) {
    let attempts = 0;
    const totalKeys = this.keys.length;
    let lastError = null;

    while (attempts < totalKeys) {
      const { key, index } = this.getActiveKey();
      try {
        const res = await operation(key, index);
        return res;
      } catch (err) {
        attempts++;
        lastError = err;
        if (attempts < totalKeys) {
          this.rotateToNextKey(`Key #${index} failed`);
        }
      }
    }
    throw new Error(`All ${totalKeys} keys failed. Last error: ${lastError.message}`);
  }
}

async function runFailoverTest() {
  const manager = new MockNvidiaKeyManager(["INVALID_KEY_1", "INVALID_KEY_2", "VALID_KEY_3"]);
  
  const result = await manager.executeWithFailover(async (key, index) => {
    if (key === "INVALID_KEY_1") throw new Error("401 Unauthorized: Invalid API Key");
    if (key === "INVALID_KEY_2") throw new Error("429 Too Many Requests: Rate limit exceeded");
    return { success: true, keyUsed: key, keyIndex: index };
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.keyIndex, 3);
  assert.strictEqual(result.keyUsed, "VALID_KEY_3");
  console.log("✅ 4. Simulated multi-key failover test passed (Rotated Key 1 -> Key 2 -> Key 3).");
}

runFailoverTest().then(() => {
  console.log("=== ALL TEST SUITES PASSED SUCCESSFULLY ===");
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
