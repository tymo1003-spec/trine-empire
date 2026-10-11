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
app.use(express.static(path.join(__dirname, "public")));

let startTime = Date.now();
let globalEvent = { name: "Штиль сети", defenseMultiplier: 1.0, rewardMultiplier: 1.0 };

// Динамический генератор глобальных событий (TRINE VM Events)
setInterval(() => {
    const events = [
        { name: "Штиль сети", defenseMultiplier: 1.0, rewardMultiplier: 1.0 },
        { name: "⚠️ Кибер-Шторм (Защита сложнее)", defenseMultiplier: 1.4, rewardMultiplier: 1.2 },
        { name: "⚡ Квантовый Всплеск (Бонус к добыче)", defenseMultiplier: 0.9, rewardMultiplier: 1.8 },
        { name: "🛡️ Солнечная Радиация (Защита снижена)", defenseMultiplier: 1.6, rewardMultiplier: 1.0 }
    ];
    globalEvent = events[Math.floor(Math.random() * events.length)];
    console.log("[EVENT] Новое сетевое событие: " + globalEvent.name);
}, 30000);

async function initDB() {
    try {
        const count = await prisma.block.count();
        if (count === 0) {
            await prisma.block.create({
                data: { index: 0, hash: "0xTRINE_GENESIS", timestamp: BigInt(Date.now()), data: "Genesis Block" }
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

app.post("/api/game/action", async (req, res) => {
    const { player, action, strategy } = req.body;
    if (!player) return res.status(400).json({ success: false, error: "Не вказано гравця" });

    let dbPlayer;
    try {
        dbPlayer = await prisma.player.findUnique({ where: { address: player } });
        if (!dbPlayer) {
            dbPlayer = await prisma.player.create({
                data: { address: player, balance: 100, streak: 0, baseLevel: 1, artifacts: "", chronicle: JSON.stringify([]) }
            });
        }
    } catch (e) {
        dbPlayer = { address: player, balance: 100, streak: 0, baseLevel: 1, artifacts: "", chronicle: "[]" };
    }

    let pState = {
        balance: dbPlayer.balance,
        streak: dbPlayer.streak,
        baseLevel: dbPlayer.baseLevel,
        artifacts: dbPlayer.artifacts ? dbPlayer.artifacts.split(",") : [],
        chronicle: JSON.parse(dbPlayer.chronicle)
    };

    const sandbox = { action, strategy: strategy || { mining: 40, defense: 40, exploration: 20 }, pState, globalEvent, result: {} };

    const vmCode = `
        let reward = 0;
        let eventLog = "";
        let newArtifact = null;
        let totalEnergy = strategy.mining + strategy.defense + strategy.exploration;
        if (totalEnergy !== 100) { strategy.mining = 40; strategy.defense = 40; strategy.exploration = 20; }
        if (action === "PROCESS_CYCLE") {
            let hazardRisk = (Math.random() * 45) * globalEvent.defenseMultiplier;
            if (strategy.defense >= hazardRisk) {
                reward = Math.round((strategy.mining * 1.5) * globalEvent.rewardMultiplier);
                pState.streak += 1;
                eventLog = "Захист відбив загрозу. [Событие: " + globalEvent.name + "].";
                if (strategy.exploration >= 25 && Math.random() < 0.25) {
                    newArtifact = "Квантовий Модуль #" + Math.floor(Math.random() * 1000);
                    pState.artifacts.push(newArtifact);
                }
            } else {
                reward = -20;
                pState.streak = 0;
                eventLog = "Увага! Пробій щитів через " + globalEvent.name + "!";
            }
            pState.balance += reward;
            if (pState.balance < 0) pState.balance = 0;
            if (pState.streak > 0 && pState.streak % 5 === 0) {
                pState.baseLevel += 1;
                eventLog += " ЕВОЛЮЦІЯ! Цитадель досягла рівень " + pState.baseLevel + "!";
            }
        } else if (action === "MINT_HERO") {
            reward = 50;
            pState.balance += reward;
            eventLog = "Створено нового оператора колонії.";
        }
        result = { reward, eventLog, newArtifact, pState };
    `;

    try {
        vm.createContext(sandbox);
        vm.runInContext(vmCode, sandbox);

        let blocksCount = 1;
        try { blocksCount = await prisma.block.count(); } catch (e) {}
        const newHash = "0xTRINE_" + Math.random().toString(16).substring(2, 14).toUpperCase();
        
        try {
            await prisma.block.create({
                data: { index: blocksCount, hash: newHash, timestamp: BigInt(Date.now()), player, action, data: sandbox.result.eventLog }
            });
        } catch (e) {}

        pState.chronicle.unshift({ block: blocksCount, text: sandbox.result.eventLog, time: new Date().toLocaleTimeString() });

        try {
            await prisma.player.update({
                where: { address: player },
                data: {
                    balance: pState.balance,
                    streak: pState.streak,
                    baseLevel: pState.baseLevel,
                    artifacts: pState.artifacts.filter(Boolean).join(","),
                    chronicle: JSON.stringify(pState.chronicle)
                }
            });
        } catch (e) {}

        res.json({ success: true, block: { index: blocksCount, hash: newHash }, gameResult: sandbox.result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("=========================================");
    console.log("🚀 TRINE Live Empire Server запущен!");
    console.log("📍 Локально: http://localhost:" + PORT);
    console.log("🌐 Готов к приёму игроков в сети.");
    console.log("=========================================");
});
