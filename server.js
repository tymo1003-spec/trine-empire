const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Глобальна схема валідації вхідних даних події через Zod
const eventSchema = z.object({
  blockNumber: z.number().int().positive(),
  txHash: z.string().min(1),
  payload: z.string().min(1),
  confirmations: z.number().int().nonnegative(),
  previousHash: z.string(),
  validatorId: z.string().min(1),
  gasFee: z.number()
});

const metrics = {
  totalRequests: 0,
  successfulEventsCreated: 0,
  errorsCount: 0
};

app.use((req, res, next) => {
  metrics.totalRequests++;
  next();
});

// Створення події
app.post('/events', async (req, res) => {
  try {
    const validatedData = eventSchema.parse(req.body);

    const existing = await prisma.event.findUnique({ 
      where: { txHash: validatedData.txHash } 
    });
    
    if (existing) {
      return res.status(200).json({ message: 'Event already exists in DB', event: existing });
    }

    const newEvent = await prisma.event.create({
      data: validatedData
    });

    metrics.successfulEventsCreated++;
    return res.status(201).json(newEvent);
  } catch (err) {
    if (err instanceof z.ZodError) {
      metrics.errorsCount++;
      return res.status(400).json({ error: "Invalid input data", details: err.errors });
    }
    metrics.errorsCount++;
    console.error('❌ Помилка обробки події:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Отримання списку подій (з необов'язковим фільтром ?validatorId=...)
app.get('/events', async (req, res) => {
  try {
    const { validatorId } = req.query;
    const whereClause = validatorId ? { validatorId: String(validatorId) } : {};
    
    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ count: events.length, events });
  } catch (err) {
    metrics.errorsCount++;
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
});

// Отримання конкретної події за txHash
app.get('/events/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const event = await prisma.event.findUnique({
      where: { txHash }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    metrics.errorsCount++;
    res.status(500).json({ error: 'Failed to fetch event', details: err.message });
  }
});

// Health-check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    metrics.errorsCount++;
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Метрики
app.get('/api/metrics', async (req, res) => {
  try {
    const dbCount = await prisma.event.count();
    res.json({
      uptime_seconds: process.uptime(),
      node_metrics: metrics,
      database_total_events: dbCount
    });
  } catch (err) {
    metrics.errorsCount++;
    res.status(500).json({ error: 'Failed to fetch metrics', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`L3 App-Chain API running on port ${PORT}`);
});
