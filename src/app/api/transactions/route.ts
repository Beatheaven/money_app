import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  const walletId = searchParams.get("walletId");
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const page = parseInt(searchParams.get("page") ?? "1");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    wallet: {
      book: bookId ? { id: bookId, userId: session.user.id } : { userId: session.user.id },
    },
  };

  if (walletId) where.walletId = walletId;
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        wallet: true,
      },
      orderBy: { date: "desc" },
      take: limit,
      skip,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, limit });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = transactionSchema.parse(body);

    // Verify wallet ownership
    const wallet = await prisma.wallet.findFirst({
      where: { id: validated.walletId, book: { userId: session.user.id } },
    });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          amount: validated.amount,
          type: validated.type as "INCOME" | "EXPENSE",
          note: validated.note,
          date: new Date(validated.date),
          walletId: validated.walletId,
          categoryId: validated.categoryId,
          budgetId: validated.budgetId || null,
        },
        include: { category: true, wallet: true },
      });

      // Update wallet balance
      const balanceDelta =
        validated.type === "INCOME" ? validated.amount : -validated.amount;
      await tx.wallet.update({
        where: { id: validated.walletId },
        data: { balance: { increment: balanceDelta } },
      });

      // Update budget spent if linked
      if (validated.budgetId) {
        if (validated.type === "EXPENSE") {
          await tx.budget.update({
            where: { id: validated.budgetId },
            data: { spent: { increment: validated.amount } },
          });
        }
      }

      return t;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
