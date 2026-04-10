import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { walletSchema } from "@/lib/validations";

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
    const validated = walletSchema.parse(body);

    const existing = await prisma.wallet.findFirst({
      where: { id, book: { userId: session.user.id } },
    });
    if (!existing)
      return NextResponse.json({ error: "Wallet tidak ditemukan." }, { status: 404 });

    const wallet = await prisma.wallet.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(wallet);
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
    const existing = await prisma.wallet.findFirst({
      where: { id, book: { userId: session.user.id } },
    });
    if (!existing)
      return NextResponse.json({ error: "Wallet tidak ditemukan." }, { status: 404 });

    const txCount = await prisma.transaction.count({
      where: { walletId: id },
    });

    if (txCount > 0) {
      return NextResponse.json(
        { error: "Dompet ini sedang digunakan oleh transaksi dan tidak dapat dihapus mutlak. Silakan kosongkan transaksinya terlebih dahulu." },
        { status: 400 }
      );
    }

    await prisma.wallet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
