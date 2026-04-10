"use client";

import { useSession } from "next-auth/react";
import { BookSwitcher } from "./BookSwitcher";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
  showMenuBtn?: boolean;
}

export function Navbar({ title, onMenuClick, showMenuBtn }: NavbarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header
      style={{
        height: 64,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(15,15,19,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {showMenuBtn && (
          <button
            onClick={onMenuClick}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <Menu size={24} />
          </button>
        )}
        {title && (
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            {title}
          </h2>
        )}
      </div>

      {/* Right: BookSwitcher + Theme Toggle + User */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <BookSwitcher />

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="glass-hover"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "transparent",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}
          title={session?.user?.name ?? "User"}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
