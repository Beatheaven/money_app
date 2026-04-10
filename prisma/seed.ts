// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcryptjs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  // EXPENSE
  { name: "Food & Drink", icon: "utensils", color: "#f59e0b", type: "EXPENSE" as const },
  { name: "Transport", icon: "car", color: "#3b82f6", type: "EXPENSE" as const },
  { name: "Shopping", icon: "shopping-bag", color: "#ec4899", type: "EXPENSE" as const },
  { name: "Communication", icon: "smartphone", color: "#8b5cf6", type: "EXPENSE" as const },
  { name: "Utilities", icon: "zap", color: "#06b6d4", type: "EXPENSE" as const },
  { name: "Health", icon: "heart-pulse", color: "#ef4444", type: "EXPENSE" as const },
  { name: "Entertainment", icon: "film", color: "#f97316", type: "EXPENSE" as const },
  { name: "Education", icon: "book-open", color: "#10b981", type: "EXPENSE" as const },
  { name: "Other Expense", icon: "more-horizontal", color: "#6b7280", type: "EXPENSE" as const },
  // INCOME
  { name: "Salary", icon: "briefcase", color: "#10b981", type: "INCOME" as const },
  { name: "Investment", icon: "trending-up", color: "#6366f1", type: "INCOME" as const },
  { name: "Freelance", icon: "laptop", color: "#f59e0b", type: "INCOME" as const },
  { name: "Other Income", icon: "plus-circle", color: "#6b7280", type: "INCOME" as const },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Seed default categories (global, userId = null)
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `default-${cat.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `default-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...cat,
        isDefault: true,
        userId: null,
      },
    });
  }
  console.log("✅ Default categories seeded");

  // Demo User
  const hashedPassword = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@moneytrack.app" },
    update: {},
    create: {
      email: "demo@moneytrack.app",
      name: "Demo User",
      password: hashedPassword,
      currency: "IDR",
    },
  });
  console.log("✅ Demo user created:", user.email);

  // Book
  const book = await prisma.book.upsert({
    where: { id: "demo-book-1" },
    update: {},
    create: {
      id: "demo-book-1",
      name: "Keuangan Pribadi",
      description: "Buku keuangan utama",
      currency: "IDR",
      color: "#6366f1",
      icon: "book",
      userId: user.id,
    },
  });

  // Wallets
  const cashWallet = await prisma.wallet.upsert({
    where: { id: "demo-wallet-cash" },
    update: {},
    create: {
      id: "demo-wallet-cash",
      name: "Kas Tunai",
      type: "CASH",
      balance: 500000,
      currency: "IDR",
      color: "#10b981",
      icon: "banknote",
      bookId: book.id,
    },
  });

  const bankWallet = await prisma.wallet.upsert({
    where: { id: "demo-wallet-bank" },
    update: {},
    create: {
      id: "demo-wallet-bank",
      name: "BCA",
      type: "BANK",
      balance: 5000000,
      currency: "IDR",
      color: "#3b82f6",
      icon: "building-2",
      bookId: book.id,
    },
  });

  const ewalletWallet = await prisma.wallet.upsert({
    where: { id: "demo-wallet-ewallet" },
    update: {},
    create: {
      id: "demo-wallet-ewallet",
      name: "GoPay",
      type: "EWALLET",
      balance: 250000,
      currency: "IDR",
      color: "#22c55e",
      icon: "smartphone",
      bookId: book.id,
    },
  });

  console.log("✅ Wallets created");

  // Transactions - last 6 months
  const now = new Date();
  const transactions = [
    { amount: 6000000, type: "INCOME" as const, categoryId: "default-salary", note: "Gaji Bulan ini", walletId: bankWallet.id, daysAgo: 1 },
    { amount: 150000, type: "EXPENSE" as const, categoryId: "default-food-&-drink", note: "Makan siang", walletId: cashWallet.id, daysAgo: 1 },
    { amount: 50000, type: "EXPENSE" as const, categoryId: "default-transport", note: "Grab ke kantor", walletId: ewalletWallet.id, daysAgo: 2 },
    { amount: 200000, type: "EXPENSE" as const, categoryId: "default-shopping", note: "Beli baju", walletId: bankWallet.id, daysAgo: 3 },
    { amount: 100000, type: "EXPENSE" as const, categoryId: "default-communication", note: "Paket internet", walletId: ewalletWallet.id, daysAgo: 5 },
    { amount: 350000, type: "EXPENSE" as const, categoryId: "default-utilities", note: "Tagihan listrik", walletId: bankWallet.id, daysAgo: 7 },
    { amount: 500000, type: "INCOME" as const, categoryId: "default-freelance", note: "Project desain", walletId: bankWallet.id, daysAgo: 10 },
    { amount: 75000, type: "EXPENSE" as const, categoryId: "default-health", note: "Beli obat", walletId: cashWallet.id, daysAgo: 12 },
    { amount: 120000, type: "EXPENSE" as const, categoryId: "default-entertainment", note: "Netflix + Spotify", walletId: bankWallet.id, daysAgo: 15 },
    { amount: 300000, type: "EXPENSE" as const, categoryId: "default-food-&-drink", note: "Groceries", walletId: ewalletWallet.id, daysAgo: 18 },
    { amount: 6000000, type: "INCOME" as const, categoryId: "default-salary", note: "Gaji bulan lalu", walletId: bankWallet.id, daysAgo: 31 },
    { amount: 180000, type: "EXPENSE" as const, categoryId: "default-food-&-drink", note: "Dinner bersama", walletId: cashWallet.id, daysAgo: 33 },
    { amount: 450000, type: "EXPENSE" as const, categoryId: "default-shopping", note: "Sepatu baru", walletId: bankWallet.id, daysAgo: 35 },
    { amount: 800000, type: "INCOME" as const, categoryId: "default-freelance", note: "Web development", walletId: bankWallet.id, daysAgo: 40 },
    { amount: 250000, type: "EXPENSE" as const, categoryId: "default-utilities", note: "Tagihan air + gas", walletId: bankWallet.id, daysAgo: 38 },
    { amount: 6000000, type: "INCOME" as const, categoryId: "default-salary", note: "Gaji 2 bulan lalu", walletId: bankWallet.id, daysAgo: 61 },
    { amount: 200000, type: "EXPENSE" as const, categoryId: "default-education", note: "Buku programming", walletId: bankWallet.id, daysAgo: 65 },
    { amount: 90000, type: "EXPENSE" as const, categoryId: "default-transport", note: "Bensin", walletId: cashWallet.id, daysAgo: 70 },
    { amount: 6000000, type: "INCOME" as const, categoryId: "default-salary", note: "Gaji 3 bulan lalu", walletId: bankWallet.id, daysAgo: 92 },
    { amount: 1500000, type: "EXPENSE" as const, categoryId: "default-shopping", note: "Gadget", walletId: bankWallet.id, daysAgo: 95 },
  ];

  for (const tx of transactions) {
    const date = new Date(now);
    date.setDate(date.getDate() - tx.daysAgo);
    await prisma.transaction.create({
      data: {
        amount: tx.amount,
        type: tx.type,
        note: tx.note,
        date,
        walletId: tx.walletId,
        categoryId: tx.categoryId,
      },
    });
  }
  console.log("✅ Transactions seeded");

  // Budget
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await prisma.budget.createMany({
    data: [
      {
        name: "Budget Makan",
        amount: 1500000,
        spent: 630000,
        period: "MONTHLY",
        startDate: startOfMonth,
        endDate: endOfMonth,
        categoryId: "default-food-&-drink",
        bookId: book.id,
      },
      {
        name: "Budget Transport",
        amount: 500000,
        spent: 140000,
        period: "MONTHLY",
        startDate: startOfMonth,
        endDate: endOfMonth,
        categoryId: "default-transport",
        bookId: book.id,
      },
      {
        name: "Budget Shopping",
        amount: 800000,
        spent: 650000,
        period: "MONTHLY",
        startDate: startOfMonth,
        endDate: endOfMonth,
        categoryId: "default-shopping",
        bookId: book.id,
      },
    ],
  });
  console.log("✅ Budgets seeded");

  console.log("🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
