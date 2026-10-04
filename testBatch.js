
const TrineClient = require("./trineClient");
const assert = require("assert");

async function runBatchTest() {
  console.log("=== STARTING BATCH SYNC TEST ===");
  const client = new TrineClient();

  const batchPayloads = [
    { sourceModule: "FinanceModule", payload: { txId: "TX-1001", amount: 500 } },
    { sourceModule: "SecurityModule", payload: { event: "login_success", user: "admin" } },
    { sourceModule: "AuditModule", payload: { action: "config_update", status: "ok" } }
  ];

  console.log("Sending batch of 3 modules...");
  const batchResult = await client.syncBatch(batchPayloads);
  console.log("Batch result:", batchResult);

  assert.strictEqual(batchResult.status, "batch_synchronized");
  assert.strictEqual(batchResult.totalSynced, 3);

  const verification = await client.verifyChain();
  console.log("Chain verification after batch:", verification);
  
  assert.strictEqual(verification.status, "chain verified");
  assert.strictEqual(verification.blockStatus, "secure");
  console.log("=== BATCH TEST PASSED SUCCESSFULLY ===");
}

runBatchTest().catch(err => {
  console.error("Batch test failed:", err.message);
  process.exit(1);
});
