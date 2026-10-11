const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const vm = require("vm");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Явний маршрут для головної сторінки без кешування
app.get("/", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.sendFile(path.join(__dirname, "public", "hud-v2.html"));
});

app.use(express.static(path.join(__dirname, "public")));

let startTime = Date.now();
let globalEvent = { name: "Штиль сети", defenseMultiplier: 1.0, rewardMultiplier: 1.0 };

setInterval(() => {
    const events = [
        { name: "Штиль сети", defenseMultiplier: 1.0, rewardMultiplier: 1.0 },
        { name: "⚠️ Кибер-Шторм (Защита сложнее)", defenseMultiplier: 1.4, rewardMultiplier: 1.2 },
        { name: "⚡ Квантовый Всплеск (Бонус к добыче)", defenseMultiplier: 0.9, rewardMultiplier: 1.8 },
        { name: "🛡️ Солнечная Радиация (Защита снижена)", defenseMultiplier: 1.6, rewardMultiplier: 1.5 }
    ];
    globalEvent = events[Math.floor(Math.random() * events.length)];
}, 30000);

async function initDB() {
    try {
        const count = await prisma.block.count();
        if (count === 0) {
            await prisma.block.create({
                data: { index: 0, hash: "0xTRINE_GENESIS", timestamp: BigInt(Date.now()), data: "Genesis" }
            });
        }
    } catch (e) {}
}
initDB();

app.get("/healthz", async (req, res) => {
    let blocksCount = 0;
    try { blocksCount = await prisma.block.count(); } catch (e) {}
    res.json({
        status: "healthy",
        blocksCount,
        uptime: (Date.now() - startTime) / 1000,
        globalEvent: globalEvent.name
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("==========================================");
    console.log("🚀 TRINE Live Empire Server запущен!");
    console.log("📍 Локально: http://localhost:" + PORT);
    console.log("🌐 Готов к приёму игроков в сети.");
    console.log("==========================================");
});
