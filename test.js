
const TrineClient = require("./trineClient");
const assert = require("assert");

async function runTests() {
  console.log("=== STARTING TRINE STRESS TESTS ===");
  const client = new TrineClient();

  console.log("Running concurrent module syncs (Mutex stress test)...");
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(client.syncModule("StressModule", { testId: i }));
  }

  await Promise.all(promises);
  console.log("All concurrent syncs completed successfully.");

  const verification = await client.verifyChain();
  console.log("Verification result:", verification);
  
  assert.strictEqual(verification.status, "chain verified");
  assert.strictEqual(verification.blockStatus, "secure");
  console.log("=== ALL TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch(err => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
