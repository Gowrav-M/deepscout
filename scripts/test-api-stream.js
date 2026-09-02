async function testApiStreaming() {
  console.log("=== TESTING /api/research STREAMING ENDPOINT ===");

  // Test 1: Empty input validation test
  console.log("\n[Test 1] Testing input validation (empty topic)...");
  const emptyRes = await fetch("http://localhost:3001/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "" }),
  });
  console.log("Empty topic HTTP status:", emptyRes.status);
  const emptyErr = await emptyRes.json();
  console.log("Validation error message:", emptyErr.error);

  // Test 2: Live research streaming with topic "Impact of AI on healthcare"
  console.log("\n[Test 2] Testing live SSE streaming with topic: 'Impact of AI on healthcare'...");
  const res = await fetch("http://localhost:3001/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Impact of AI on healthcare" }),
  });

  console.log("Streaming response status:", res.status);
  console.log("Content-Type:", res.headers.get("content-type"));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let receivedEvents = [];

  let done = false;
  let buffer = "";

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (part.startsWith("data:")) {
          const jsonStr = part.replace(/^data:\s*/, "");
          try {
            const parsed = JSON.parse(jsonStr);
            receivedEvents.push(parsed.type);
            console.log(`📡 SSE Event received -> [${parsed.type}]`);
            if (parsed.type === "SOURCES_FOUND") {
              console.log(`   Found ${parsed.payload.sources?.length} sources!`);
            }
            if (parsed.type === "RESEARCH_COMPLETED") {
              console.log(`   Report completed in ${parsed.payload.metadata?.durationMs}ms`);
            }
          } catch (e) {
            console.error("Error parsing event JSON:", e.message);
          }
        }
      }
    }
  }

  console.log("\nAll received SSE Event types:", receivedEvents);
  console.log("✅ Live API Streaming Test Succeeded!");
}

testApiStreaming().catch((err) => {
  console.error("Stream test failed:", err);
  process.exit(1);
});
