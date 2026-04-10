"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Tag,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { href: "/wallets", icon: Wallet, label: "Wallet" },
  { href: "/budgets", icon: Target, label: "Budget" },
  { href: "/categories", icon: Tag, label: "Kategori" },
  { href: "/reports", icon: FileText, label: "Laporan" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        overflow: "hidden",
        zIndex: 100,
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          💰
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            MoneyTrack
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Personal Finance</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav
        style={{
          flex: 1,
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#818cf8" : "var(--text-secondary)",
                background: isActive
                  ? "rgba(99,102,241,0.12)"
                  : "transparent",
                border: isActive ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Link
          href="/settings"
          onClick={() => {
            if (isMobile) setIsOpen(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 14,
            color: "var(--text-secondary)",
            border: "1px solid transparent",
            transition: "all 0.15s",
          }}
        >
          <Settings size={17} />
          Pengaturan
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            fontSize: 14,
            color: "#fb7185",
            background: "none",
            border: "1px solid transparent",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            transition: "all 0.15s",
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
