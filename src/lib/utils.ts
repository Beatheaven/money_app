import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getCurrencyInfo } from "./currencies";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "IDR"
): string {
  const currency = getCurrencyInfo(currencyCode);
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "IDR" || currencyCode === "JPY" || currencyCode === "KRW" ? 0 : 2,
    maximumFractionDigits: currencyCode === "IDR" || currencyCode === "JPY" || currencyCode === "KRW" ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: Date | string, fmt: string = "dd MMM yyyy"): string {
  return format(new Date(date), fmt, { locale: id });
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateColor(): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#f59e0b", "#10b981", "#06b6d4",
    "#3b82f6", "#84cc16",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
