"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  date: string;
  category: { name: string; icon: string; color: string };
  wallet: { name: string; currency: string };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading: boolean;
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
            Transaksi Terbaru
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>5 transaksi terakhir</p>
        </div>
        <Link
          href="/transactions"
          style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}
        >
          Lihat semua →
        </Link>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: 52, borderRadius: 10 }} className="skeleton" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "32px 0",
          }}
        >
          <span style={{ fontSize: 32 }}>💸</span>
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
            Belum ada transaksi
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {transactions.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";
            const iconColor = isIncome ? "#10b981" : isTransfer ? "#8b5cf6" : "#f43f5e";
            
            return (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  transition: "all 0.15s",
                }}
              >
                {/* Category icon circle */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: `${tx.category.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 15,
                  }}
                >
                  {isIncome ? (
                    <ArrowUpRight size={16} color={iconColor} />
                  ) : isTransfer ? (
                    <ArrowRightLeft size={16} color={iconColor} />
                  ) : (
                    <ArrowDownLeft size={16} color={iconColor} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.note ?? tx.category.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                    {tx.category.name} · {formatDate(tx.date, "dd MMM")}
                  </div>
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isTransfer ? "var(--text-primary)" : isIncome ? "#10b981" : "#f43f5e",
                    flexShrink: 0,
                  }}
                >
                  {isIncome ? "+" : isTransfer ? "" : "-"}
                  {formatCurrency(tx.amount, tx.wallet.currency)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
