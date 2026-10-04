const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const event = await prisma.chainEvent.create({
    data: {
      blockNumber: 1,
      txHash: "0x" + Math.random().toString(16).substring(2, 14),
      payload: "Genesis Block Event for L3 App-Chain"
    },
  })
  console.log("Successfully recorded L3 event:", event)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
