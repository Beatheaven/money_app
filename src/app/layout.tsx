import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "MoneyTrack — Personal Finance Manager",
  description:
    "Track your income, expenses, budgets, and wallets in one beautiful app. Multi-book, multi-currency personal finance tracking inspired by Money+.",
  keywords: ["finance", "money tracking", "budget", "expense tracker", "personal finance"],
  authors: [{ name: "MoneyTrack" }],
  openGraph: {
    title: "MoneyTrack — Personal Finance Manager",
    description: "Track your personal finances beautifully.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
