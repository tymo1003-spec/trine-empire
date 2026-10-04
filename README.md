# TRINE Empire Core

Modular, high-integrity blockchain system built with Node.js, Express, and Prisma (SQLite).

## Features
* **Cryptographic Integrity:** SHA-256 block linking with previous hash verification.
* **Concurrency Control:** Asynchronous `Mutex` for thread-safe write serialization.
* **Atomic Transactions:** Prisma \`$transaction\` guarantees for state commits.
* **Checkpoint System:** Rapid validation and state verification.
* **SDK & Domain Modules:** Includes `TrineClient` with batch synchronization and specialized modules for Finance, Security, and Advanced Audit logging.

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Initialize database:
   ```bash
   npx prisma db push
   ```
3. Run integration tests:
   ```bash
   node testIntegration.js
   ```
