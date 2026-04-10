export type TransactionType = "INCOME" | "EXPENSE";
export type WalletType = "CASH" | "BANK" | "EWALLET" | "INVESTMENT" | "CREDIT" | "OTHER";
export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  currency: string;
  createdAt: Date;
}

export interface Book {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  icon: string;
  color: string;
  userId: string;
  wallets?: Wallet[];
  budgets?: Budget[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  bookId: string;
  transactions?: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  userId: string | null;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  note: string | null;
  date: Date;
  walletId: string;
  wallet?: Wallet;
  categoryId: string;
  category?: Category;
  budgetId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  categoryId: string;
  category?: Category;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: string;
}
