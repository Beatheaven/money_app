"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export interface DashboardData {
  totalBalance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  savingsRate: number;
  wallets: Array<{
    id: string;
    name: string;
    balance: number;
    currency: string;
    color: string;
    icon: string;
    type: string;
  }>;
  monthlyData: Array<{ month: string; income: number; expense: number }>;
  categoryChartData: Array<{ name: string; value: number; color: string; icon: string }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    note: string | null;
    date: string;
    category: { name: string; icon: string; color: string };
    wallet: { name: string; currency: string };
  }>;
}

export default function DashboardPage() {
  const { activeBookId } = useBookStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBookId) return;
    setLoading(true);
    fetch(`/api/dashboard?bookId=${activeBookId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeBookId]);

  if (!activeBookId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          textAlign: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48 }}>📚</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
          Pilih Buku Keuangan
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Pilih buku di menu atas untuk mulai melihat dashboard Anda
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
            marginBottom: 4,
          }}
        >
          Dashboard 📊
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Ringkasan keuangan bulan ini
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={data} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={data?.monthlyData ?? []} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart data={data?.categoryChartData ?? []} loading={loading} />
        </div>
      </div>

      {/* Wallets + Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WalletOverview wallets={data?.wallets ?? []} loading={loading} />
        <RecentTransactions transactions={data?.recentTransactions ?? []} loading={loading} />
      </div>
    </div>
  );
}
