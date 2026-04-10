"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  date: string;
  category: { name: string; icon: string; color: string };
  wallet: { name: string; currency: string };
}

export default function TransactionsPage() {
  const { activeBookId } = useBookStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  async function fetchTransactions() {
    if (!activeBookId) return;
    setLoading(true);
    const params = new URLSearchParams({
      bookId: activeBookId,
      limit: LIMIT.toString(),
      page: page.toString(),
    });
    if (typeFilter) params.set("type", typeFilter);

    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchTransactions();
  }, [activeBookId, page, typeFilter]);

  const filtered = search
    ? transactions.filter(
        (tx) =>
          tx.note?.toLowerCase().includes(search.toLowerCase()) ||
          tx.category.name.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Transaksi 💸
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {total} transaksi ditemukan
          </p>
        </div>
        <Link
          href="/transactions/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          <Plus size={16} />
          Tambah Transaksi
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base"
            style={{ paddingLeft: 36 }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-base"
          style={{ width: "auto", minWidth: 130, cursor: "pointer" }}
        >
          <option value="">Semua Tipe</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 64, margin: "1px 16px" }} className="skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
            <p style={{ fontSize: 14 }}>Belum ada transaksi ditemukan</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <span>Keterangan</span>
              <span>Kategori</span>
              <span>Tanggal</span>
              <span style={{ textAlign: "right" }}>Nominal</span>
            </div>

            {/* Rows */}
            {filtered.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <div
                  key={tx.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Description */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: isIncome ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isIncome ? (
                        <ArrowUpRight size={15} color="#10b981" />
                      ) : (
                        <ArrowDownLeft size={15} color="#f43f5e" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {tx.note ?? tx.category.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {tx.wallet.name}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: `${tx.category.color}18`,
                        border: `1px solid ${tx.category.color}40`,
                        fontSize: 11,
                        fontWeight: 500,
                        color: tx.category.color,
                      }}
                    >
                      {tx.category.name}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {formatDate(tx.date)}
                  </div>

                  {/* Amount */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isIncome ? "#10b981" : "#f43f5e",
                      textAlign: "right",
                    }}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(tx.amount, tx.wallet.currency)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.5 : 1,
              fontSize: 13,
            }}
          >
            ← Prev
          </button>
          <span style={{ padding: "8px 16px", color: "var(--text-secondary)", fontSize: 13 }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.5 : 1,
              fontSize: 13,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
