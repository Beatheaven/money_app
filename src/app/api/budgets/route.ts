import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validations";
import { addMonths, addWeeks, addYears, addDays } from "date-fns";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  let budgets = await prisma.budget.findMany({
    where: {
      bookId: bookId ?? undefined,
      book: { userId: session.user.id },
    },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();
  const budgetsToCreate: any[] = [];
  const budgetsToUpdateId: string[] = [];

  for (const b of budgets) {
    if (b.isAutoRenew) {
      let currentEnd = new Date(b.endDate);
      let isExpired = currentEnd < now;

      let iterations = 0;
      while (isExpired && iterations < 36) { // Max 36 clones (3 years) to prevent loops
        const newStart = currentEnd;
        let newEnd = new Date(currentEnd);
        
        switch (b.period) {
          case "MONTHLY": newEnd = addMonths(newEnd, 1); break;
          case "WEEKLY": newEnd = addWeeks(newEnd, 1); break;
          case "YEARLY": newEnd = addYears(newEnd, 1); break;
          case "DAILY": newEnd = addDays(newEnd, 1); break;
        }

        budgetsToCreate.push({
          name: b.name,
          amount: b.amount,
          period: b.period,
          categoryId: b.categoryId,
          bookId: b.bookId,
          isAutoRenew: true,
          startDate: newStart,
          endDate: newEnd,
        });

        currentEnd = newEnd;
        isExpired = currentEnd < now;
        iterations++;
      }

      if (iterations > 0) {
        budgetsToUpdateId.push(b.id);
      }
    }
  }

  // Execute clones if necessary
  if (budgetsToCreate.length > 0 || budgetsToUpdateId.length > 0) {
    if (budgetsToUpdateId.length > 0) {
      await prisma.budget.updateMany({
        where: { id: { in: budgetsToUpdateId } },
        data: { isAutoRenew: false }, // Turn off flag for historical records
      });
    }
    if (budgetsToCreate.length > 0) {
      await prisma.budget.createMany({ data: budgetsToCreate });
    }

    // Refetch the complete list since it changed
    budgets = await prisma.budget.findMany({
      where: { bookId: bookId ?? undefined, book: { userId: session.user.id } },
      include: { category: true },
      orderBy: { endDate: "desc" }, // Most recent active budgets first
    });
  }

  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = budgetSchema.parse(body);

    const book = await prisma.book.findFirst({
      where: { id: validated.bookId, userId: session.user.id },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const budget = await prisma.budget.create({
      data: {
        name: validated.name,
        amount: validated.amount,
        period: validated.period as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        isAutoRenew: (validated as any).isAutoRenew ?? false,
        categoryId: validated.categoryId,
        bookId: validated.bookId,
      },
      include: { category: true },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
