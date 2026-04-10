"use client";

import { useEffect, useRef, useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { ChevronDown, BookOpen, Plus, Check } from "lucide-react";

interface Book {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
}

export function BookSwitcher() {
  const { activeBookId, setActiveBookId } = useBookStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreateBook(e: React.FormEvent) {
    e.preventDefault();
    if (!newBookName) return;
    setCreating(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use default IDR for now, could be dynamic
        body: JSON.stringify({ name: newBookName, currency: "IDR" }),
      });
      if (!res.ok) throw new Error("Gagal membuat buku");
      const book = await res.json();
      setBooks((prev) => [...prev, book]);
      setActiveBookId(book.id);
      setIsModalOpen(false);
      setNewBookName("");
    } catch (err) {
      console.error(err);
      alert("Gagal membuat buku.");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBooks(data);
          if (!activeBookId && data.length > 0) {
            setActiveBookId(data[0].id);
          }
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeBook = books.find((b) => b.id === activeBookId) ?? books[0];

  if (loading) {
    return (
      <div
        style={{
          height: 34,
          width: 120,
          borderRadius: 8,
          background: "var(--surface-2)",
          animation: "shimmer 1.5s infinite",
        }}
      />
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 8,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          transition: "all 0.15s",
        }}
        id="book-switcher-btn"
      >
        <span style={{ fontSize: 14 }}>📚</span>
        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeBook?.name ?? "Pilih Buku"}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            Buku Keuangan
          </div>
          {books.map((book) => (
            <button
              key={book.id}
              onClick={() => {
                setActiveBookId(book.id);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background:
                  activeBookId === book.id ? "rgba(99,102,241,0.1)" : "transparent",
                border: "none",
                color: activeBookId === book.id ? "#818cf8" : "var(--text-primary)",
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <BookOpen size={15} />
              <span style={{ flex: 1 }}>{book.name}</span>
              {activeBookId === book.id && <Check size={14} />}
            </button>
          ))}
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => {
                setOpen(false);
                setIsModalOpen(true);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                color: "#818cf8",
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Plus size={15} />
              Buat Buku Baru
            </button>
          </div>
        </div>
      )}

      {/* Create Book Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              width: "100%",
              maxWidth: 400,
              borderRadius: 20,
              border: "1px solid var(--border)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                Buat Buku Baru
              </h3>
            </div>
            <form onSubmit={handleCreateBook} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
                  Nama Buku
                </label>
                <input
                  required
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="Misal: Keuangan Usaha"
                  className="input-base"
                />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "var(--surface-2)",
                    color: "var(--text-primary)",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: creating ? "wait" : "pointer",
                    opacity: creating ? 0.7 : 1,
                  }}
                >
                  {creating ? "Menyimpan..." : "Buat Buku"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
