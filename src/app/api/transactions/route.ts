import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
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

  const wallets = await prisma.wallet.findMany({
    where: {
      book: bookId ? { id: bookId, userId: session.user.id } : { userId: session.user.id },
    },
    select: { id: true }
  });
  const walletIds = wallets.map(w => w.id);

  if (walletIds.length === 0) {
    return NextResponse.json({ transactions: [], total: 0, page, limit });
  }

  const where: Record<string, unknown> = {
    walletId: { in: walletIds },
  };

  if (walletId) {
    if (!walletIds.includes(walletId)) {
      return NextResponse.json({ transactions: [], total: 0, page, limit });
    }
    where.walletId = walletId;
  }
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        wallet: true,
        toWallet: true,
      },
      orderBy: { date: "desc" },
      take: limit,
      skip,
    }),
    prisma.transaction.count({ where }),
  ]);

  const mappedTransactions = transactions.map(tx => ({
    ...tx,
    category: tx.category || {
        id: "sys-transfer", name: "Transfer", icon: "arrow-right-left", color: "#8b5cf6", type: "TRANSFER"
    }
  }));

  return NextResponse.json({ transactions: mappedTransactions, total, page, limit });
  } catch (error: any) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    const body = await request.json();
    const validated = transactionSchema.parse(body);

    // Verify wallet ownership
    const wallet = await prisma.wallet.findUnique({
      where: { id: validated.walletId },
      include: { book: true }
    });
    if (!wallet || wallet.book.userId !== userId) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const transaction = await prisma.$transaction(async (tx) => {
      // Extra logic to verify destination wallet existence if TRANSFER
      if (validated.type === "TRANSFER" && validated.toWalletId) {
        const toWallet = await tx.wallet.findUnique({
            where: { id: validated.toWalletId },
            include: { book: true }
        });
        if (!toWallet || toWallet.book.userId !== userId) throw new Error("Destination Wallet not found");
      }

      const t = await tx.transaction.create({
        data: {
          amount: validated.amount,
          type: validated.type as "INCOME" | "EXPENSE" | "TRANSFER",
          note: validated.note,
          date: new Date(validated.date),
          walletId: validated.walletId,
          toWalletId: validated.toWalletId || null,
          categoryId: validated.categoryId || null,
          budgetId: validated.budgetId || null,
        },
        include: { category: true, wallet: true },
      });

      // Update wallet balances based on transaction type
      if (validated.type === "TRANSFER") {
          // Decrement source
          await tx.wallet.update({
             where: { id: validated.walletId },
             data: { balance: { decrement: validated.amount } },
          });
          // Increment destination
          if (validated.toWalletId) {
              await tx.wallet.update({
                  where: { id: validated.toWalletId },
                  data: { balance: { increment: validated.amount } },
              });
          }
      } else {
          const balanceDelta = validated.type === "INCOME" ? validated.amount : -validated.amount;
          await tx.wallet.update({
            where: { id: validated.walletId },
            data: { balance: { increment: balanceDelta } },
          });
      }

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
  } catch (error: any) {
    if (error?.name === "ZodError" || error?.issues) {
      console.error("Zod Validation Error:", error.issues);
      return NextResponse.json({ error: "Validation Error", issues: error.issues }, { status: 400 });
    }
    console.error("Transaction POST Error:", error);
    return NextResponse.json({ error: error?.message || "Invalid data" }, { status: 400 });
  }
}
