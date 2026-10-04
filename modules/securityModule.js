class SecurityModule {
  constructor(client) {
    this.client = client;
    this.sourceModule = "SecurityModule";
  }

  async logEvent(eventType, severity, details) {
    return await this.client.syncModule(this.sourceModule, {
      action: "security_event",
      eventType,
      severity,
      details
    });
  }
}
module.exports = SecurityModule;
