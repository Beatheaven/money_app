"use client";

import { useEffect, useState } from "react";
import { Plus, Lock, Edit2, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
}

const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "EXPENSE" as "INCOME" | "EXPENSE", color: "#6366f1" });
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function handleEditClick(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, type: cat.type as "EXPENSE" | "INCOME", color: cat.color });
    setShowForm(true);
  }

  function handleCloseModal() {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", type: "EXPENSE" as "INCOME" | "EXPENSE", color: "#6366f1" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error || "Gagal menghapus kategori.");
      return;
    }
    
    await fetchCategories();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    
    await fetchCategories();
    handleCloseModal();
    setFormLoading(false);
  }

  const filtered = categories.filter((c) => c.type === activeTab);
  const defaults = filtered.filter((c) => c.isDefault);
  const custom = filtered.filter((c) => !c.isDefault);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Kategori 🏷️
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{categories.length} kategori tersedia</p>
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
          Tambah Kategori
        </button>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: 4, background: "var(--surface)", borderRadius: 10, padding: 4, width: "fit-content", border: "1px solid var(--border)" }}>
        {(["EXPENSE", "INCOME"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === type
                ? type === "INCOME" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"
                : "transparent",
              color: activeTab === type
                ? type === "INCOME" ? "#10b981" : "#f43f5e"
                : "var(--text-secondary)",
              transition: "all 0.15s",
            }}
          >
            {type === "INCOME" ? "📈 Pemasukan" : "📉 Pengeluaran"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ height: 72, borderRadius: 12 }} className="skeleton" />
          ))}
        </div>
      ) : (
        <>
          {/* Default Categories */}
          {defaults.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Lock size={12} color="var(--text-muted)" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Kategori Default
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                {defaults.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: `${cat.color}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 15,
                      }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Categories */}
          {custom.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                Kategori Kustom
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                {custom.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "var(--surface)",
                      border: `1px solid ${cat.color}40`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: cat.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.name}</span>
                    </div>
                    
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleEditClick(cat)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4 }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", padding: 4 }} title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
              {editId ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Nama</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" placeholder="Nama kategori" required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Tipe</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["EXPENSE", "INCOME"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setForm({ ...form, type })} style={{ padding: "10px", borderRadius: 10, border: form.type === type ? `1.5px solid ${type === "INCOME" ? "#10b981" : "#f43f5e"}` : "1.5px solid var(--border)", background: form.type === type ? (type === "INCOME" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)") : "var(--surface-2)", color: form.type === type ? (type === "INCOME" ? "#10b981" : "#f43f5e") : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 10 }}>Warna</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid white" : "2px solid transparent", cursor: "pointer", outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: 2 }} />
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
