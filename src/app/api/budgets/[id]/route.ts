import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validations";

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
    const validated = budgetSchema.parse(body);

    const existing = await prisma.budget.findFirst({
      where: { id, book: { userId: session.user.id } },
    });
    if (!existing)
      return NextResponse.json({ error: "Budget tidak ditemukan." }, { status: 404 });

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        name: validated.name,
        amount: validated.amount,
        period: validated.period as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        isAutoRenew: (validated as any).isAutoRenew ?? false,
        categoryId: validated.categoryId,
      },
    });

    return NextResponse.json(budget);
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
    const existing = await prisma.budget.findFirst({
      where: { id, book: { userId: session.user.id } },
    });
    if (!existing)
      return NextResponse.json({ error: "Budget tidak ditemukan." }, { status: 404 });

    await prisma.budget.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
