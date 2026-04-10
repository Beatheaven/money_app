"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import type { DashboardData } from "@/app/(app)/dashboard/page";
import { motion } from "framer-motion";
import CountUp from "react-countup";

interface SummaryCardsProps {
  data: DashboardData | null;
  loading: boolean;
}

const cards = [
  {
    key: "totalBalance",
    label: "Total Saldo",
    icon: Wallet,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    prefix: "",
  },
  {
    key: "incomeThisMonth",
    label: "Pemasukan Bulan Ini",
    icon: TrendingUp,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    prefix: "↑ ",
  },
  {
    key: "expenseThisMonth",
    label: "Pengeluaran Bulan Ini",
    icon: TrendingDown,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    prefix: "↓ ",
  },
  {
    key: "savingsRate",
    label: "Savings Rate",
    icon: PiggyBank,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    isPercent: true,
  },
];

import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};


export function SummaryCards({ data, loading }: SummaryCardsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const value = data ? (data as unknown as Record<string, number>)[card.key] : 0;

        return (
          <motion.div
            variants={itemVariants}
            key={card.key}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transition: "all 0.2s ease",
            }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}
          >
            {/* Icon */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} color={card.color} strokeWidth={2} />
            </div>

            {/* Value */}
            <div>
              {loading ? (
                <div
                  style={{
                    height: 28,
                    width: "80%",
                    borderRadius: 6,
                    background: "var(--surface-2)",
                  }}
                  className="skeleton"
                />
              ) : (
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  {card.isPercent ? (
                    <CountUp end={value} suffix="%" duration={2} />
                  ) : (
                    <CountUp
                      end={value}
                      duration={2}
                      formattingFn={(val) => formatCurrency(val, "IDR")}
                    />
                  )}
                </div>
              )}
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                 {card.prefix}{card.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

