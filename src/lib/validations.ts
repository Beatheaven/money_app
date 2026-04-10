import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  currency: z.string().default("IDR"),
});

export const bookSchema = z.object({
  name: z.string().min(1, "Nama buku wajib diisi"),
  description: z.string().optional(),
  currency: z.string().default("IDR"),
  color: z.string().default("#6366f1"),
  icon: z.string().default("book"),
});

export const walletSchema = z.object({
  name: z.string().min(1, "Nama wallet wajib diisi"),
  type: z.enum(["CASH", "BANK", "EWALLET", "INVESTMENT", "CREDIT", "OTHER"]),
  balance: z.number().default(0),
  currency: z.string().default("IDR"),
  color: z.string().default("#6366f1"),
  icon: z.string().default("wallet"),
  bookId: z.string().min(1),
});

export const transactionSchema = z.object({
  amount: z.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  note: z.string().optional(),
  date: z.string(),
  walletId: z.string().min(1, "Pilih wallet sumber"),
  toWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  budgetId: z.string().optional(),
}).refine((data) => {
  if (data.type === "TRANSFER") {
    if (!data.toWalletId) return false;
    if (data.walletId === data.toWalletId) return false;
  } else {
    if (!data.categoryId) return false;
  }
  return true;
}, {
  message: "Pastikan dompet tujuan dipilih untuk transfer, atau kategori dipilih untuk selain transfer.",
  path: ["toWalletId"], // Setting path helps attach the error to proper field in some forms
});

export const budgetSchema = z.object({
  name: z.string().min(1, "Nama budget wajib diisi"),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string(),
  endDate: z.string(),
  categoryId: z.string().min(1, "Pilih kategori"),
  bookId: z.string().min(1),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  icon: z.string().default("tag"),
  color: z.string().default("#6366f1"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type WalletInput = z.infer<typeof walletSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
