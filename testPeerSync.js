const TrineClient = require('./trineClient');

async function runComprehensiveTest() {
    console.log("=== STARTING COMPREHENSIVE P2P & CHAIN TEST ===");

    // Ініціалізуємо клієнта з кількома пеєрами для тесту масштабування мережі
    const client = new TrineClient("http://localhost:3000", [
        "http://localhost:3001",
        "http://localhost:3002" // Симуляція додаткового вузла
    ]);

    const mockBlock = {
        index: 2,
        timestamp: Date.now(),
        data: JSON.stringify({ testModule: "MULTI_PEER_SYNC", payload: { status: "verified" } }),
        previousHash: "00492ff3231bbde9a5d5cea632aa7e4ada08ce6f35b643622e089953c57594e8"
    };

    try {
        console.log("\n1. Broadcasting block to multiple peers...");
        const broadcastResults = await client.broadcastBlock(mockBlock);
        console.log("Broadcast results:", JSON.stringify(broadcastResults, null, 2));

        console.log("\n2. Verifying blockchain integrity (verifyChain)...");
        const chainStatus = await client.verifyChain();
        console.log("Chain validation status:", JSON.stringify(chainStatus, null, 2));

    } catch (error) {
        console.error("Test execution failed:", error.message);
    }

    console.log("\n=== COMPREHENSIVE TEST FINISHED ===");
}

runComprehensiveTest();

