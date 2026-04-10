import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  const budgets = await prisma.budget.findMany({
    where: {
      bookId: bookId ?? undefined,
      book: { userId: session.user.id },
    },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

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
