import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tx = await prisma.transaction.findFirst({
      where: { id, wallet: { book: { userId: session.user.id } } },
      include: { category: true, wallet: true },
    });

    if (!tx)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    return NextResponse.json(tx);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = transactionSchema.parse(body);

    const oldTx = await prisma.transaction.findFirst({
      where: { id, wallet: { book: { userId: session.user.id } } },
    });

    if (!oldTx)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const newWallet = await prisma.wallet.findFirst({
      where: { id: validated.walletId, book: { userId: session.user.id } },
    });

    if (!newWallet)
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // 1. REVERSE OLD
      if (oldTx.type === "TRANSFER") {
          await tx.wallet.update({
             where: { id: oldTx.walletId },
             data: { balance: { increment: oldTx.amount } }, // Return money to source
          });
          if (oldTx.toWalletId) {
             await tx.wallet.update({
                 where: { id: oldTx.toWalletId },
                 data: { balance: { decrement: oldTx.amount } }, // Take money back from destination
             });
          }
      } else {
          const reverseAmount = oldTx.type === "INCOME" ? -oldTx.amount : oldTx.amount;
          await tx.wallet.update({
            where: { id: oldTx.walletId },
            data: { balance: { increment: reverseAmount } },
          });

          if (oldTx.budgetId && oldTx.type === "EXPENSE") {
            await tx.budget.update({
              where: { id: oldTx.budgetId },
              data: { spent: { decrement: oldTx.amount } },
            });
          }
      }

      // 2. APPLY NEW
      if (validated.type === "TRANSFER") {
          // Extra logic to verify destination wallet existence if TRANSFER
          if (validated.toWalletId) {
            const toWallet = await tx.wallet.findFirst({
                where: { id: validated.toWalletId, book: { userId: session.user.id } },
            });
            if (!toWallet) throw new Error("Destination Wallet not found");
          }

          await tx.wallet.update({
             where: { id: validated.walletId },
             data: { balance: { decrement: validated.amount } }, // Decrease source
          });
          if (validated.toWalletId) {
             await tx.wallet.update({
                 where: { id: validated.toWalletId },
                 data: { balance: { increment: validated.amount } }, // Increase destination
             });
          }
      } else {
          const applyAmount = validated.type === "INCOME" ? validated.amount : -validated.amount;
          await tx.wallet.update({
            where: { id: validated.walletId },
            data: { balance: { increment: applyAmount } },
          });

          if (validated.budgetId && validated.type === "EXPENSE") {
            await tx.budget.update({
              where: { id: validated.budgetId },
              data: { spent: { increment: validated.amount } },
            });
          }
      }

      // 3. UPDATE TRANSACTION
      return await tx.transaction.update({
        where: { id },
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
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const oldTx = await prisma.transaction.findFirst({
      where: { id, wallet: { book: { userId: session.user.id } } },
    });

    if (!oldTx)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Reverse old effect
      if (oldTx.type === "TRANSFER") {
          await tx.wallet.update({
             where: { id: oldTx.walletId },
             data: { balance: { increment: oldTx.amount } }, // Return money to source
          });
          if (oldTx.toWalletId) {
             await tx.wallet.update({
                 where: { id: oldTx.toWalletId },
                 data: { balance: { decrement: oldTx.amount } }, // Take money back from destination
             });
          }
      } else {
          const reverseAmount = oldTx.type === "INCOME" ? -oldTx.amount : oldTx.amount;
          await tx.wallet.update({
            where: { id: oldTx.walletId },
            data: { balance: { increment: reverseAmount } },
          });

          if (oldTx.budgetId && oldTx.type === "EXPENSE") {
            await tx.budget.update({
              where: { id: oldTx.budgetId },
              data: { spent: { decrement: oldTx.amount } },
            });
          }
      }

      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
