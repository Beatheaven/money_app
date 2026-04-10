"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { formatCurrency } from "@/lib/utils";
import { Plus, Banknote, Building2, Smartphone, TrendingUp, CreditCard, Wallet, Edit2, Trash2 } from "lucide-react";

const WALLET_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote,
  BANK: Building2,
  EWALLET: Smartphone,
  INVESTMENT: TrendingUp,
  CREDIT: CreditCard,
  OTHER: Wallet,
};

const WALLET_TYPES = [
  { value: "CASH", label: "Tunai" },
  { value: "BANK", label: "Bank" },
  { value: "EWALLET", label: "E-Wallet" },
  { value: "INVESTMENT", label: "Investasi" },
  { value: "CREDIT", label: "Kartu Kredit" },
  { value: "OTHER", label: "Lainnya" },
];

const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];

interface WalletData {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

export default function WalletsPage() {
  const { activeBookId } = useBookStore();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "CASH", balance: "0", currency: "IDR", color: "#6366f1" });

  async function fetchWallets() {
    if (!activeBookId) return;
    const res = await fetch(`/api/wallets?bookId=${activeBookId}`);
    const data = await res.json();
    setWallets(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchWallets(); }, [activeBookId]);

  function handleEditClick(wallet: WalletData) {
    setEditId(wallet.id);
    setForm({ name: wallet.name, type: wallet.type, balance: wallet.balance.toString(), currency: wallet.currency, color: wallet.color });
    setShowForm(true);
  }

  function handleCloseModal() {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", type: "CASH", balance: "0", currency: "IDR", color: "#6366f1" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus DOMPET ini beserta PERMANEN?")) return;
    
    const res = await fetch(`/api/wallets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error || "Gagal menghapus dompet.");
      return;
    }
    await fetchWallets();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    
    if (editId) {
      await fetch(`/api/wallets/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, balance: parseFloat(form.balance), bookId: activeBookId }),
      });
    } else {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, balance: parseFloat(form.balance), bookId: activeBookId }),
      });
    }
    
    await fetchWallets();
    handleCloseModal();
    setFormLoading(false);
  }

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Wallet 💳
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Total saldo: {formatCurrency(totalBalance, "IDR")}
          </p>
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
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          <Plus size={16} />
          Tambah Wallet
        </button>
      </div>

      {/* Wallet Cards Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 140, borderRadius: 16 }} className="skeleton" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "2px dashed var(--border)",
            borderRadius: 16,
            padding: "60px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Belum ada wallet</p>
          <p style={{ fontSize: 13 }}>Tambahkan wallet pertama Anda</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {wallets.map((wallet) => {
            const Icon = WALLET_ICONS[wallet.type] ?? Wallet;
            return (
              <div
                key={wallet.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    borderRadius: "0 16px 0 80px",
                    background: `${wallet.color}18`,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: `${wallet.color}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  >
                    <Icon size={20} color={wallet.color} />
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, zIndex: 1 }}>
                    <button onClick={() => handleEditClick(wallet)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer", padding: 6 }} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(wallet.id)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "#f43f5e", cursor: "pointer", padding: 6 }} title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                  {WALLET_TYPES.find((t) => t.value === wallet.type)?.label ?? wallet.type}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  {wallet.name}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: wallet.balance >= 0 ? "var(--text-primary)" : "#f43f5e",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {formatCurrency(wallet.balance, wallet.currency)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
              {editId ? "Edit Wallet" : "Tambah Wallet Baru"}
            </h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Nama Wallet</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-base"
                  placeholder="Cth: BCA, Dana, Dompet"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Tipe</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-base"
                  style={{ cursor: "pointer" }}
                >
                  {WALLET_TYPES.map((t) => (
                    <option key={t.value} value={t.value} style={{ background: "var(--surface)" }}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Saldo Awal</label>
                <input
                  type="number"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className="input-base"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10 }}>Warna</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c,
                        border: form.color === c ? "3px solid white" : "2px solid transparent",
                        cursor: "pointer",
                        outline: form.color === c ? `2px solid ${c}` : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={handleCloseModal} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={formLoading} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{formLoading ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
