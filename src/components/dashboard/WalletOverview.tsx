"use client";

import { formatCurrency } from "@/lib/utils";
import { Banknote, Building2, Smartphone, TrendingUp, CreditCard, Wallet } from "lucide-react";

const WALLET_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote,
  BANK: Building2,
  EWALLET: Smartphone,
  INVESTMENT: TrendingUp,
  CREDIT: CreditCard,
  OTHER: Wallet,
};

interface WalletOverviewProps {
  wallets: Array<{
    id: string;
    name: string;
    balance: number;
    currency: string;
    color: string;
    icon: string;
    type: string;
  }>;
  loading: boolean;
}

export function WalletOverview({ wallets, loading }: WalletOverviewProps) {
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px",
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
            Dompet Saya
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Total: {formatCurrency(totalBalance, "IDR")}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 60, borderRadius: 10 }} className="skeleton" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          💳 Belum ada wallet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {wallets.map((wallet) => {
            const Icon = WALLET_ICONS[wallet.type] ?? Wallet;
            const percent =
              totalBalance > 0 ? Math.round((wallet.balance / totalBalance) * 100) : 0;

            return (
              <div
                key={wallet.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  border: "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${wallet.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={wallet.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {wallet.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: "var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percent}%`,
                        borderRadius: 2,
                        background: wallet.color,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
