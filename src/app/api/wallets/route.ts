import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { walletSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  const wallets = await prisma.wallet.findMany({
    where: {
      bookId: bookId ?? undefined,
      book: { userId: session.user.id },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(wallets);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = walletSchema.parse(body);

    // Verify book ownership
    const book = await prisma.book.findFirst({
      where: { id: validated.bookId, userId: session.user.id },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const wallet = await prisma.wallet.create({ data: validated });
    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
