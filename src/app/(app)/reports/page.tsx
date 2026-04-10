"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Download, Calendar } from "lucide-react";

export default function ReportsPage() {
  const { activeBookId } = useBookStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  async function fetchReport() {
    if (!activeBookId) return;
    setLoading(true);
    const params = new URLSearchParams({
      bookId: activeBookId,
      limit: "500",
    });
    const res = await fetch(`/api/transactions?${params}`);
    const raw = await res.json();
    const txns = (raw.transactions ?? []).filter((tx: any) => {
      const d = new Date(tx.date);
      return d >= new Date(dateRange.start) && d <= new Date(dateRange.end + "T23:59:59");
    });

    const income = txns.filter((t: any) => t.type === "INCOME").reduce((s: number, t: any) => s + t.amount, 0);
    const expense = txns.filter((t: any) => t.type === "EXPENSE").reduce((s: number, t: any) => s + t.amount, 0);

    setData({ txns, income, expense, balance: income - expense });
    setLoading(false);
  }

  useEffect(() => { fetchReport(); }, [activeBookId]);

  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPdf() {
    if (!data) return;
    setIsExporting(true);
    try {
      const { generatePdfBlob } = await import("@/components/reports/ReportPdf");
      const blob = await generatePdfBlob(data, dateRange);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_MoneyTrack_${dateRange.start}_to_${dateRange.end}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal membuat PDF", error);
      alert("Gagal membuat PDF. Coba kembali.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>
          Laporan Keuangan 📄
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Export dan analisis data keuangan Anda</p>
      </div>

      {/* Date Range */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
            Dari Tanggal
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input-base"
            style={{ width: "auto", colorScheme: "dark" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input-base"
            style={{ width: "auto", colorScheme: "dark" }}
          />
        </div>
        <button
          onClick={fetchReport}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Calendar size={15} />
          Tampilkan
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Total Pemasukan", value: data.income, color: "#10b981" },
            { label: "Total Pengeluaran", value: data.expense, color: "#f43f5e" },
            { label: "Saldo Bersih", value: data.balance, color: data.balance >= 0 ? "#10b981" : "#f43f5e" },
          ].map((card) => (
            <div key={card.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color, letterSpacing: "-0.5px" }}>
                {formatCurrency(card.value, "IDR")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions Table */}
      {data && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {data.txns.length} Transaksi
            </span>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 8,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: isExporting ? "wait" : "pointer",
                opacity: isExporting ? 0.7 : 1,
              }}
            >
              <Download size={14} />
              {isExporting ? "Membuat PDF..." : "Print / Save PDF"}
            </button>
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              <span>Tanggal</span>
              <span>Keterangan</span>
              <span>Kategori</span>
              <span>Wallet</span>
              <span style={{ textAlign: "right" }}>Nominal</span>
            </div>
            {data.txns.slice(0, 50).map((tx: any) => (
              <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>{formatDate(tx.date, "dd/MM/yy")}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{tx.note ?? tx.category.name}</span>
                <span>
                  <span style={{ padding: "2px 8px", borderRadius: 20, background: `${tx.category.color}18`, color: tx.category.color, fontSize: 11, fontWeight: 500 }}>
                    {tx.category.name}
                  </span>
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{tx.wallet.name}</span>
                <span style={{ textAlign: "right", fontWeight: 700, color: tx.type === "INCOME" ? "#10b981" : "#f43f5e" }}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount, tx.wallet.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
