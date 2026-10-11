const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function synchronizeWithPeer(peerUrl, localUrl = 'http://127.0.0.1:3001') {
    try {
        console.log(`[P2P] Запитуємо ланцюжок у сусіда: ${peerUrl}...`);
        const response = await fetch(`${peerUrl}/api/chain`);
        
        if (!response.ok) {
            throw new Error(`Помилка отримання ланцюга від сусіда: ${response.statusText}`);
        }

        const peerChain = await response.json();
        console.log(`[P2P] Отримано ланцюг довжиною: ${peerChain.length} блоків.`);

        // Отримуємо локальний ланцюг
        const localResponse = await fetch(`${localUrl}/api/chain`);
        const localChain = await localResponse.json();
        console.log(`[P2P] Локальний ланцюг має довжину: ${localChain.length} блоків.`);

        // Правило найдовшого ланцюга (Longest Chain Rule)
        if (peerChain.length > localChain.length) {
            console.log(`[P2P] Знайдено довший ланцюг у сусіда! Починаємо оновлення локальної бази...`);
            
            // Очищуємо стару локальну базу та записуємо новий ланцюг
            await prisma.block.deleteMany({});
            
            for (const block of peerChain) {
                await prisma.block.create({
                    data: {
                        id: block.id,
                        timestamp: block.timestamp,
                        data: block.data,
                        prevHash: block.prevHash,
                        hash: block.hash,
                        nonce: block.nonce,
                        difficulty: block.difficulty
                    }
                });
            }

            console.log(`[P2P] Синхронізація успішно завершена! Базу оновлено до довжини ${peerChain.length}.`);
        } else {
            console.log(`[P2P] Локальний ланцюг актуальний або довший. Зміни не потрібні.`);
        }

    } catch (error) {
        console.error(`[P2P] Помилка синхронізації:`, error.message);
    } finally {
        await prisma.$disconnect();
    }
}

synchronizeWithPeer('http://127.0.0.1:3002');
