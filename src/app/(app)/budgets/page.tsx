"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string;
  startDate: string;
  endDate: string;
  category: { name: string; color: string; icon: string };
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

export default function BudgetsPage() {
  const { activeBookId } = useBookStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    period: "MONTHLY",
    categoryId: "",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
  });

  async function fetchData() {
    if (!activeBookId) return;
    const [budRes, catRes] = await Promise.all([
      fetch(`/api/budgets?bookId=${activeBookId}`),
      fetch("/api/categories"),
    ]);
    const [bud, cat] = await Promise.all([budRes.json(), catRes.json()]);
    setBudgets(Array.isArray(bud) ? bud : []);
    setCategories((Array.isArray(cat) ? cat : []).filter((c: Category) => c.type === "EXPENSE"));
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [activeBookId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), bookId: activeBookId }),
    });
    await fetchData();
    setShowForm(false);
    setFormLoading(false);
  }

  function getBudgetStatus(budget: Budget) {
    const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    if (pct >= 90) return { color: "#f43f5e", bgColor: "rgba(244,63,94,0.1)", label: "Kritis" };
    if (pct >= 70) return { color: "#f59e0b", bgColor: "rgba(245,158,11,0.1)", label: "Peringatan" };
    return { color: "#10b981", bgColor: "rgba(16,185,129,0.1)", label: "Aman" };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Budget 🎯
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{budgets.length} budget aktif</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Buat Budget
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => <div key={i} style={{ height: 120, borderRadius: 16 }} className="skeleton" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "2px dashed var(--border)", borderRadius: 16, padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Belum ada budget</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Buat budget untuk kontrol pengeluaran Anda</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const pct = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
            const remaining = budget.amount - budget.spent;

            return (
              <div
                key={budget.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: `${budget.category.color}18`,
                          border: `1px solid ${budget.category.color}40`,
                          fontSize: 11,
                          fontWeight: 500,
                          color: budget.category.color,
                        }}
                      >
                        {budget.category.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: "var(--surface-2)",
                        }}
                      >
                        {PERIOD_LABELS[budget.period]}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {budget.name}
                    </h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
                      {Math.round(pct)}% terpakai
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: status.color,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: status.bgColor,
                      }}
                    >
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: status.color,
                        width: `${pct}%`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Terpakai: <strong style={{ color: "#f43f5e" }}>{formatCurrency(budget.spent, "IDR")}</strong>
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Sisa: <strong style={{ color: remaining >= 0 ? "#10b981" : "#f43f5e" }}>
                      {formatCurrency(remaining, "IDR")}
                    </strong>
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Limit: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(budget.amount, "IDR")}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Budget */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Buat Budget Baru</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Nama Budget</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" placeholder="Cth: Budget Makan" required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Kategori</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-base" style={{ cursor: "pointer" }} required>
                  <option value="">Pilih kategori...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "var(--surface)" }}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Limit Nominal</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-base" placeholder="0" min="0" step="any" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Tanggal Mulai</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-base" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Tanggal Akhir</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-base" style={{ colorScheme: "dark" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={formLoading} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{formLoading ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
