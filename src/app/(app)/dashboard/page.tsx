"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { RotateCcw } from "lucide-react";

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

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (!activeBookId) return;
    setLoading(true);
    fetch(`/api/dashboard?bookId=${activeBookId}&month=${selectedMonth}&year=${selectedYear}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeBookId, selectedMonth, selectedYear]);

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
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
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
            Ringkasan keuangan Anda
          </p>
        </div>
        
        {/* Period Filter */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", padding: "4px 6px", borderRadius: 12 }}>
             <select 
               className="input-base" 
               style={{ border: "none", padding: "6px 12px", minHeight: "unset", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(Number(e.target.value))}
             >
               {Array.from({ length: 12 }, (_, i) => {
                 const d = new Date(2000, i, 1);
                 return <option key={i} value={i + 1} style={{ background: "var(--surface)" }}>{d.toLocaleDateString("id-ID", { month: "long" })}</option>
               })}
             </select>
             <select 
               className="input-base" 
               style={{ border: "none", padding: "6px 12px", minHeight: "unset", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
               value={selectedYear}
               onChange={(e) => setSelectedYear(Number(e.target.value))}
             >
               {Array.from({ length: 11 }, (_, i) => {
                 const y = currentDate.getFullYear() - 5 + i;
                 return <option key={y} value={y} style={{ background: "var(--surface)" }}>{y}</option>
               })}
             </select>
          </div>
          <button
             onClick={() => {
               setSelectedMonth(currentDate.getMonth() + 1);
               setSelectedYear(currentDate.getFullYear());
             }}
             style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               padding: "10px",
               borderRadius: 12,
               background: "var(--surface)",
               border: "1px solid var(--border)",
               color: "var(--text-secondary)",
               cursor: "pointer",
               transition: "all 0.2s"
             }}
             title="Reset ke bulan ini"
             onMouseEnter={(e) => e.currentTarget.style.background = "var(--border)"}
             onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}
          >
            <RotateCcw size={18} />
          </button>
        </div>
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
