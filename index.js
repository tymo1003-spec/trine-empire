BigInt.prototype.toJSON = function() { return Number(this); };
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

class Mutex {
  constructor() {
    this.queue = Promise.resolve();
  }
  runExclusive(callback) {
    let unlock;
    const p = new Promise((resolve) => { unlock = resolve; });
    const oldQueue = this.queue;
    this.queue = p;
    return oldQueue.then(async () => {
      try {
        return await callback();
      } finally {
        unlock();
      }
    });
  }
}
const blockMutex = new Mutex();

app.post("/api/module/sync", async (req, res) => {
  try {
    const { sourceModule, payload } = req.body;
    if (!sourceModule || !payload) {
      return res.status(400).json({ error: "Missing sourceModule or payload" });
    }

    const result = await blockMutex.runExclusive(async () => {
      return await prisma.$transaction(async (tx) => {
        const lastBlock = await tx.block.findFirst({
          orderBy: { index: "desc" },
        });

        const newIndex = lastBlock ? lastBlock.index + 1 : 1;
        const prevHash = lastBlock ? lastBlock.hash : "0";
        const timestamp = Date.now();
        const dataString = JSON.stringify({ sourceModule, payload });
        
        const hash = crypto
          .createHash("sha256")
          .update(newIndex + prevHash + timestamp + dataString)
          .digest("hex");

        const newBlock = await tx.block.create({
          data: {
            index: newIndex,
            timestamp,
            data: dataString,
            prevHash,
            hash,
          },
        });

        return newBlock;
      });
    });

    res.json({ status: "synchronized", block: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/verify", async (req, res) => {
  try {
    const blocks = await prisma.block.findMany({
      orderBy: { index: "asc" },
    });

    if (blocks.length === 0) {
      return res.json({ status: "chain empty", totalBlocks: 0, blockStatus: "secure" });
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const expectedPrevHash = i === 0 ? "0" : blocks[i - 1].hash;

      if (block.prevHash !== expectedPrevHash) {
        return res.status(400).json({
          status: "integrity compromised",
          brokenAtIndex: block.index,
          reason: "Invalid prevHash linkage"
        });
      }

      const recalculatedHash = crypto
        .createHash("sha256")
        .update(block.index + block.prevHash + block.timestamp + block.data)
        .digest("hex");

      if (block.hash !== recalculatedHash) {
        return res.status(400).json({
          status: "integrity compromised",
          brokenAtIndex: block.index,
          reason: "Hash mismatch detected"
        });
      }
    }

    const lastBlock = blocks[blocks.length - 1];
    res.json({
      status: "chain verified",
      totalBlocks: blocks.length,
      blockStatus: "secure",
      checkpoint: {
        index: lastBlock.index,
        hash: lastBlock.hash,
        timestamp: lastBlock.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
