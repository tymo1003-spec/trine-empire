const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.block.count();
    console.log('Current block count:', count);

    const block = await prisma.block.create({
      data: {
        name: 'Direct Test Block',
        index: count + 1,
        timestamp: BigInt(Date.now()),
        data: 'Test payload data',
        hash: '0xabc123...'
      }
    });
    console.log('Successfully created block:', {
      ...block,
      timestamp: block.timestamp.toString()
    });
  } catch (e) {
    console.error('PRISMA ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
