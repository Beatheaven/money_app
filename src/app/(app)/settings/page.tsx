"use client";

import { useSession } from "next-auth/react";
import { CURRENCIES } from "@/lib/currencies";
import { useState } from "react";
import { User, Globe } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [currency, setCurrency] = useState(
    (session?.user as any)?.currency ?? "IDR"
  );

  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Reload session if possible to reflect currency
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Gagal merubah mata uang");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 540, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>
          Pengaturan ⚙️
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Kelola akun dan preferensi Anda</p>
      </div>

      {/* Profile */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <User size={18} color="#818cf8" />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Profil</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              {session?.user?.name ?? "User"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {session?.user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Preferences */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Globe size={18} color="#818cf8" />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Mata Uang</h2>
        </div>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
              Mata Uang Default
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-base"
              style={{ cursor: "pointer" }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "var(--surface)" }}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: "11px 20px",
              borderRadius: 10,
              background: saved ? "rgba(16,185,129,0.8)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s",
              width: "fit-content",
            }}
          >
            {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* App Info */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Tentang Aplikasi
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Versi", value: "1.0.0" },
            { label: "Framework", value: "Next.js 16 + Prisma v7" },
            { label: "Database", value: "SQLite (dev)" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
