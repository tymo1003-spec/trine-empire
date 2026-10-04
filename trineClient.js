class TrineClient {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  async syncModule(sourceModule, payload) {
    if (!sourceModule || typeof sourceModule !== "string") {
      throw new Error("Invalid sourceModule specified");
    }
    if (!payload || typeof payload !== "object") {
      throw new Error("Payload must be a non-null object");
    }

    const response = await fetch(`${this.baseUrl}/api/module/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceModule, payload }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to synchronize module");
    }
    return data;
  }

  async syncBatch(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Batch items must be a non-empty array");
    }

    const results = [];
    for (const item of items) {
      const res = await this.syncModule(item.sourceModule, item.payload);
      results.push(res);
    }
    return { status: "batch_synchronized", totalSynced: results.length, results };
  }

  async verifyChain() {
    const response = await fetch(`${this.baseUrl}/verify`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Chain verification failed");
    }
    return data;
  }
}

module.exports = TrineClient;
