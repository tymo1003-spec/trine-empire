const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/blocks', async (req, res) => {
  try {
    const blocks = await prisma.block.findMany();
    res.json(blocks.map(b => ({
      ...b,
      timestamp: b.timestamp ? b.timestamp.toString() : null
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/blocks', async (req, res) => {
  try {
    const count = await prisma.block.count();
    const block = await prisma.block.create({
      data: {
        name: req.body.name || 'Default Block',
        index: count + 1,
        timestamp: BigInt(Date.now())
      }
    });
    res.status(201).json({
      ...block,
      timestamp: block.timestamp.toString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
