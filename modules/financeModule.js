class FinanceModule {
  constructor(client) {
    this.client = client;
    this.sourceModule = "FinanceModule";
  }

  async recordTransaction(txId, amount, currency = "USD") {
    return await this.client.syncModule(this.sourceModule, {
      action: "record_transaction",
      txId,
      amount,
      currency
    });
  }
}
module.exports = FinanceModule;
