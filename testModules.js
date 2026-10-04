
const TrineClient = require("./trineClient");
const FinanceModule = require("./modules/financeModule");
const SecurityModule = require("./modules/securityModule");
const assert = require("assert");

async function runDomainModulesTest() {
  console.log("=== STARTING DOMAIN MODULES TEST ===");
  const client = new TrineClient();
  
  const finance = new FinanceModule(client);
  const security = new SecurityModule(client);

  console.log("Recording financial transaction...");
  const finRes = await finance.recordTransaction("TX-99901", 1500, "EUR");
  console.log("Finance result:", finRes);

  console.log("Logging security event...");
  const secRes = await security.logEvent("UNAUTHORIZED_ACCESS_ATTEMPT", "HIGH", { ip: "192.168.1.50" });
  console.log("Security result:", secRes);

  const verification = await client.verifyChain();
  console.log("Chain verification:", verification);

  assert.strictEqual(verification.status, "chain verified");
  assert.strictEqual(verification.blockStatus, "secure");
  console.log("=== DOMAIN MODULES TEST PASSED SUCCESSFULLY ===");
}

runDomainModulesTest().catch(err => {
  console.error("Domain test failed:", err.message);
  process.exit(1);
});
