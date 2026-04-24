"use client";

import { useState, useEffect, useRef } from "react";

interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
  /** Font size for the display value */
  large?: boolean;
}

/**
 * AmountInput — A mobile-friendly numeric input with a custom numpad.
 * Features: digits 1–9, backspace, "0", and "000" shortcuts.
 * On desktop, falls back gracefully (numpad shows on focus).
 */
export default function AmountInput({
  value,
  onChange,
  label,
  id = "amount",
  required = false,
  large = false,
}: AmountInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close numpad when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function press(key: string) {
    if (key === "⌫") {
      onChange(value.length > 1 ? value.slice(0, -1) : "0");
    } else if (key === "000") {
      if (value === "0") return; // don't produce "0000"
      onChange(value + "000");
    } else {
      // digit
      if (value === "0") {
        onChange(key); // replace leading zero
      } else {
        if (value.length >= 15) return; // cap at 15 digits
        onChange(value + key);
      }
    }
  }

  const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"];

  const displayValue = value === "" ? "0" : Number(value).toLocaleString("id-ID");

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}

      {/* Display field — acts as the trigger */}
      <div
        id={id}
        role="button"
        tabIndex={0}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((p) => !p);
          // Allow backspace/delete from keyboard too
          if (e.key === "Backspace") press("⌫");
          if (/^\d$/.test(e.key)) press(e.key);
        }}
        style={{
          width: "100%",
          padding: large ? "14px 16px" : "12px 16px",
          borderRadius: 12,
          background: "var(--surface-2)",
          border: open ? "1.5px solid #6366f1" : "1.5px solid var(--border)",
          color: value && value !== "0" ? "var(--text-primary)" : "var(--text-muted)",
          fontSize: large ? 26 : 16,
          fontWeight: large ? 800 : 600,
          cursor: "pointer",
          letterSpacing: "-0.5px",
          transition: "border-color 0.15s",
          userSelect: "none",
          outline: "none",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ flex: 1 }}>{displayValue}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* Hidden native input for form validation */}
      <input
        type="hidden"
        name={id}
        value={value}
        required={required}
      />

      {/* Numpad */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 600,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 12,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          {numpadKeys.map((key) => {
            const isBackspace = key === "⌫";
            const isZero = key === "0";
            const isTripleZero = key === "000";
            return (
              <button
                key={key}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault(); // prevent losing focus / closing
                  press(key);
                }}
                style={{
                  padding: "14px 8px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: isBackspace
                    ? "rgba(244,63,94,0.1)"
                    : isTripleZero
                    ? "rgba(99,102,241,0.1)"
                    : "var(--surface-2)",
                  color: isBackspace
                    ? "#f43f5e"
                    : isTripleZero
                    ? "#6366f1"
                    : "var(--text-primary)",
                  fontSize: isTripleZero ? 13 : 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.1s, transform 0.08s",
                  letterSpacing: "-0.3px",
                  lineHeight: 1,
                }}
                onPointerEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                }}
                onPointerLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
