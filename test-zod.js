const { z } = require('zod');

const transactionSchema = z.object({
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

const testData = {
  amount: 10000,
  type: "EXPENSE",
  note: undefined,
  date: "2026-04-17",
  walletId: "clk12345",
  categoryId: "cat12345"
};

try {
  console.log(transactionSchema.parse(testData));
  console.log("Success");
} catch(e) {
  console.error("Failed:", e.issues || e);
}
