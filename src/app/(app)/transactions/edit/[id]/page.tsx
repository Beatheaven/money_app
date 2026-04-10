"use client";

import { useEffect, useState, use } from "react";
import { useBookStore } from "@/store/bookStore";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
}

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { activeBookId } = useBookStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE" | "TRANSFER",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    walletId: "",
    toWalletId: "",
    categoryId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/wallets?bookId=${activeBookId}`).then((r) => r.json()),
      fetch(`/api/transactions/${id}`).then((r) => r.json()),
    ]).then(([cats, wals, txData]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setWallets(Array.isArray(wals) ? wals : []);
      if (txData && !txData.error) {
          setForm({
              type: txData.type as "INCOME" | "EXPENSE" | "TRANSFER",
              amount: txData.amount.toString(),
              note: txData.note || "",
              date: new Date(txData.date).toISOString().split("T")[0],
              walletId: txData.walletId,
              toWalletId: txData.toWalletId || "",
              categoryId: txData.categoryId || "",
          });
      }
      setLoading(false);
    });
  }, [activeBookId, id]);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = parseFloat(form.amount);

    if (!amount || amount <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }
    if (!form.walletId) {
      setError("Pilih wallet");
      return;
    }
    if (form.type === "TRANSFER") {
      if (!form.toWalletId) {
        setError("Pilih dompet tujuan");
        return;
      }
      if (form.walletId === form.toWalletId) {
        setError("Dompet asal dan tujuan tidak boleh sama");
        return;
      }
    } else {
      if (!form.categoryId) {
        setError("Pilih kategori");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          type: form.type,
          note: form.note || null,
          date: form.date,
          walletId: form.walletId,
          toWalletId: form.type === "TRANSFER" ? form.toWalletId : undefined,
          categoryId: form.type !== "TRANSFER" ? form.categoryId : undefined,
        }),
      });

      if (res.ok) {
        router.push("/transactions");
      } else {
        const d = await res.json();
        setError(d.error ?? "Gagal menyimpan transaksi");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link
          href="/transactions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Edit Transaksi
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Ubah detail pencatatan Anda</p>
        </div>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {error && (
            <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fb7185" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10 }}>
              Tipe Transaksi
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type, categoryId: "", toWalletId: "" })}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 10,
                    border: form.type === type
                      ? `1.5px solid ${type === "INCOME" ? "#10b981" : type === "EXPENSE" ? "#f43f5e" : "#8b5cf6"}`
                      : "1.5px solid var(--border)",
                    background: form.type === type
                      ? type === "INCOME" ? "rgba(16,185,129,0.12)" : type === "EXPENSE" ? "rgba(244,63,94,0.12)" : "rgba(139,92,246,0.12)"
                      : "var(--surface-2)",
                    color: form.type === type
                      ? type === "INCOME" ? "#10b981" : type === "EXPENSE" ? "#f43f5e" : "#8b5cf6"
                      : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4
                  }}
                >
                  {type === "INCOME" ? "📈 Pemasukan" : type === "EXPENSE" ? "📉 Pengeluaran" : "🔄 Transfer"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
              Nominal
            </label>
            <input
              id="amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              min="0"
              step="any"
              required
              className="input-base"
              style={{ fontSize: 22, fontWeight: 700 }}
            />
          </div>

          {/* Wallet */}
          <div>
            <label htmlFor="wallet" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
              Wallet
            </label>
            <select
              id="wallet"
              value={form.walletId}
              onChange={(e) => setForm({ ...form, walletId: e.target.value })}
              className="input-base"
              style={{ cursor: "pointer" }}
              required
            >
              <option value="">Pilih wallet...</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} style={{ background: "var(--surface)" }}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional: Category OR Destination Wallet */}
          {form.type === "TRANSFER" ? (
            <div>
              <label htmlFor="toWallet" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
                Dompet Tujuan
              </label>
              <select
                id="toWallet"
                value={form.toWalletId}
                onChange={(e) => setForm({ ...form, toWalletId: e.target.value })}
                className="input-base"
                style={{ cursor: "pointer" }}
                required
              >
                <option value="">Pilih dompet tujuan...</option>
                {wallets.filter(w => w.id !== form.walletId).map((w) => (
                  <option key={w.id} value={w.id} style={{ background: "var(--surface)" }}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10 }}>
                Kategori
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  maxHeight: 200,
                  overflowY: "auto",
                  padding: "2px",
                }}
              >
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, categoryId: cat.id })}
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: form.categoryId === cat.id
                        ? `1.5px solid ${cat.color}`
                        : "1.5px solid var(--border)",
                      background: form.categoryId === cat.id ? `${cat.color}18` : "var(--surface-2)",
                      color: form.categoryId === cat.id ? cat.color : "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "center",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="date" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
              Tanggal
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-base"
              style={{ colorScheme: "dark" }}
              required
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
              Catatan (opsional)
            </label>
            <input
              id="note"
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Tambahkan catatan..."
              className="input-base"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi ✓"}
          </button>
        </form>
      </div>
    </div>
  );
}
