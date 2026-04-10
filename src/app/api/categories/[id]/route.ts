import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    const existing = await prisma.category.findFirst({
      where: { id: params.id, userId: session.user.id, isDefault: false },
    });

    if (!existing)
      return NextResponse.json({ error: "Category not found or cannot be edited" }, { status: 404 });

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        type: validated.type,
        color: validated.color,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await prisma.category.findFirst({
      where: { id: params.id, userId: session.user.id, isDefault: false },
    });

    if (!existing)
      return NextResponse.json({ error: "Category not found or cannot be deleted" }, { status: 404 });

    // Cek proteksi Foreign Key secara logis
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: params.id },
    });
    
    const budgetsCount = await prisma.budget.count({
      where: { categoryId: params.id },
    });

    if (transactionsCount > 0 || budgetsCount > 0) {
      return NextResponse.json(
        { error: "Kategori sedang digunakan oleh transaksi atau budget dan tidak dapat dihapus." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
