import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/budgets/recalculate
 * Recalculates the `spent` field for all budgets belonging to the current user
 * by summing existing EXPENSE transactions that match each budget's
 * categoryId, bookId, and date range.
 *
 * This is needed to backfill budgets for transactions that were created
 * before the auto-deduct logic was implemented.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Fetch all budgets owned by this user
  const budgets = await prisma.budget.findMany({
    where: { book: { userId } },
  });

  if (budgets.length === 0) {
    return NextResponse.json({ message: "Tidak ada budget untuk dihitung.", updated: 0 });
  }

  let updated = 0;

  for (const budget of budgets) {
    // Sum all EXPENSE transactions that match this budget's category + date range + book
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: "EXPENSE",
        categoryId: budget.categoryId,
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
        wallet: {
          bookId: budget.bookId,
        },
      },
    });

    const totalSpent = result._sum.amount ?? 0;

    // Only update if the value changed to minimize DB writes
    if (totalSpent !== budget.spent) {
      await prisma.budget.update({
        where: { id: budget.id },
        data: { spent: totalSpent },
      });
      updated++;
    }
  }

  return NextResponse.json({
    message: `Recalculation selesai. ${updated} budget diperbarui dari ${budgets.length} total.`,
    updated,
    total: budgets.length,
  });
}
