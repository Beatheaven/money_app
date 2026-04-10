import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          background: "rgba(15, 15, 19, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            }}
          >
            💰
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            MoneyTrack
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/login"
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            Login
          </Link>
          <Link
            href="/register"
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "20%",
            width: 300,
            height: 300,
            background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 100,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: 32,
            fontSize: 13,
            fontWeight: 500,
            color: "#818cf8",
          }}
        >
          ✨ Personal Finance, Simplified
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            marginBottom: 24,
            maxWidth: 720,
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>Track Your Money</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Like Never Before
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: 48,
          }}
        >
          Multi-book financial tracking with beautiful charts, smart budgets, wallet management,
          and PDF reports — inspired by Money+.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/register"
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.3px",
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🚀 Start for Free
          </Link>
          <Link
            href="/login"
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Login →
          </Link>
        </div>

        {/* Demo credentials hint */}
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Demo: <code style={{ color: "#818cf8" }}>demo@moneytrack.app</code> /{" "}
          <code style={{ color: "#818cf8" }}>demo1234</code>
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          {[
            { icon: "📚", label: "Multi-Book" },
            { icon: "💳", label: "Wallet Management" },
            { icon: "📊", label: "Smart Charts" },
            { icon: "🎯", label: "Budget Tracking" },
            { icon: "🌍", label: "Multi-Currency" },
            { icon: "📄", label: "PDF Reports" },
          ].map((feature) => (
            <div
              key={feature.label}
              style={{
                padding: "10px 20px",
                borderRadius: 100,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {feature.icon} {feature.label}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "24px 40px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        © 2024 MoneyTrack. Built with Next.js, Prisma & ❤️
      </footer>
    </div>
  );
}
