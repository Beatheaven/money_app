const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const bookId = 'cmnsm0af1000109kzlv2eo80i';
    const userId = 'user-x'; // fake user

    const where = {
      wallet: {
        book: { id: bookId, userId }
      },
    };

    const count = await prisma.transaction.count({ where });
    console.log("Count is", count);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
