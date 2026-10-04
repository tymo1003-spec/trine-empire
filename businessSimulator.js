const TrineClient = require("./trineClient");

(async () => {
  const client = new TrineClient();
  
  console.log("Simulating external business module event...");
  
  const result = await client.registerDecision(
    "EXP-02",
    "Business Expansion & Cross-Module Integration",
    "Successfully integrated external business simulator via TrineClient SDK."
  );

  console.log("Business Module Sync Result:", result);

  const verification = await client.verifyChain();
  console.log("Chain Status After Business Sync:", verification);
})();
