import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId: session.user.id },
  });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  let now = new Date();
  if (yearParam && monthParam) {
    now = new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
  }
  
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  // Total balance (sum of all wallets)
  const wallets = await prisma.wallet.findMany({
    where: { bookId },
    select: { id: true, name: true, balance: true, currency: true, color: true, icon: true, type: true },
  });
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  // This month income & expense
  const thisMonthTxns = await prisma.transaction.findMany({
    where: {
      wallet: { bookId },
      date: { gte: thisMonthStart, lte: thisMonthEnd },
    },
    select: { amount: true, type: true },
  });

  const incomeThisMonth = thisMonthTxns
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseThisMonth = thisMonthTxns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = incomeThisMonth > 0
    ? Math.round(((incomeThisMonth - expenseThisMonth) / incomeThisMonth) * 100)
    : 0;

  // Monthly chart data (last 6 months)
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      return prisma.transaction.findMany({
        where: {
          wallet: { bookId },
          date: { gte: startOfMonth(month), lte: endOfMonth(month) },
        },
        select: { amount: true, type: true },
      }).then((txns) => ({
        month: month.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
        income: txns.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expense: txns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }));
    })
  );

  // Category breakdown this month
  const categoryData = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      wallet: { bookId },
      type: "EXPENSE",
      date: { gte: thisMonthStart, lte: thisMonthEnd },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 6,
  });

  const categoryIds = categoryData
    .map((c) => c.categoryId)
    .filter((id): id is string => id !== null);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true, icon: true },
  });

  const categoryChartData = categoryData.map((c) => {
    const cat = categories.find((cat) => cat.id === c.categoryId);
    return {
      name: cat?.name ?? "Lainnya",
      value: c._sum.amount ?? 0,
      color: cat?.color ?? "#6b7280",
      icon: cat?.icon ?? "tag",
    };
  });

  // Recent transactions (last 5 in selected month)
  const recentTransactions = await prisma.transaction.findMany({
    where: { 
      wallet: { bookId },
      date: { gte: thisMonthStart, lte: thisMonthEnd }
    },
    include: { category: true, wallet: true, toWallet: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  const mappedRecentTransactions = recentTransactions.map(tx => ({
    ...tx,
    category: tx.category || {
        id: "sys-transfer", name: "Transfer", icon: "arrow-right-left", color: "#8b5cf6", type: "TRANSFER"
    }
  }));

  return NextResponse.json({
    totalBalance,
    incomeThisMonth,
    expenseThisMonth,
    savingsRate,
    wallets,
    monthlyData,
    categoryChartData,
    recentTransactions: mappedRecentTransactions,
  });
}
