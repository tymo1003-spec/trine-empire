
const TrineClient = require("./trineClient");
const FinanceModule = require("./modules/financeModule");
const SecurityModule = require("./modules/securityModule");
const AdvancedSecurityModule = require("./modules/advancedSecurityModule");
const assert = require("assert");

async function runFullIntegration() {
  console.log("=== STARTING TRINE FULL INTEGRATION SUITE ===");
  const client = new TrineClient();

  const finance = new FinanceModule(client);
  const security = new SecurityModule(client);
  const advancedSec = new AdvancedSecurityModule(client);

  console.log("1. Executing individual domain operations...");
  await finance.recordTransaction("TX-INTEG-01", 9999, "USD");
  await security.logEvent("INTEGRATION_CHECK", "LOW", { test: true });

  console.log("2. Executing batch synchronization...");
  await client.syncBatch([
    { sourceModule: "FinanceModule", payload: { action: "batch_tx", amount: 120 } },
    { sourceModule: "AdvancedSecurityModule", payload: { action: "batch_audit", status: "clean" } }
  ]);

  console.log("3. Executing advanced security incident report...");
  await advancedSec.reportIncident("INTEGRATION_STRESS", "MEDIUM", { verified: true });

  console.log("4. Verifying entire blockchain integrity and checkpoint...");
  const verification = await client.verifyChain();
  console.log("Integration verification result:", verification);

  assert.strictEqual(verification.status, "chain verified");
  assert.strictEqual(verification.blockStatus, "secure");
  console.log("=== FULL INTEGRATION SUITE PASSED SUCCESSFULLY ===");
}

runFullIntegration().catch(err => {
  console.error("Integration suite failed:", err.message);
  process.exit(1);
});
