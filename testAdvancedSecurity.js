
const TrineClient = require("./trineClient");
const AdvancedSecurityModule = require("./modules/advancedSecurityModule");
const assert = require("assert");

async function runAdvancedSecurityTest() {
  console.log("=== STARTING ADVANCED SECURITY TEST ===");
  const client = new TrineClient();
  const sec = new AdvancedSecurityModule(client);

  console.log("Auditing user access attempt...");
  const auditRes = await sec.auditAccess("admin_system", true, { role: "superuser" });
  console.log("Audit result:", auditRes);

  console.log("Reporting critical security incident...");
  const incidentRes = await sec.reportIncident("BRUTE_FORCE_DETECTED", "CRITICAL", { attempts: 42 });
  console.log("Incident result:", incidentRes);

  const verification = await client.verifyChain();
  console.log("Final chain verification:", verification);

  assert.strictEqual(verification.status, "chain verified");
  assert.strictEqual(verification.blockStatus, "secure");
  console.log("=== ADVANCED SECURITY TEST PASSED SUCCESSFULLY ===");
}

runAdvancedSecurityTest().catch(err => {
  console.error("Advanced security test failed:", err.message);
  process.exit(1);
});
