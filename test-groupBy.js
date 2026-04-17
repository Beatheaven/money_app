const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const data = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        wallet: { bookId: 'some-book-id' },
        type: "EXPENSE"
      },
      _sum: { amount: true }
    });
    console.log(data);
  } catch (err) {
    console.error("Prisma error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
