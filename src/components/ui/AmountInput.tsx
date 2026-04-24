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
  // Convert internal raw string (e.g. "1500000") to formatted display string (e.g. "1.500.000")
  const displayValue = value ? Number(value).toLocaleString("id-ID") : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters (including dots from our formatting)
    const rawValue = e.target.value.replace(/\D/g, "");
    
    // Prevent starting with multiple zeros unless it's just "0"
    if (rawValue.length > 1 && rawValue.startsWith("0")) {
      onChange(rawValue.replace(/^0+/, ""));
    } else {
      onChange(rawValue);
    }
  };

  const handleTripleZero = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!value || value === "0") return; // don't make "0000"
    onChange(value + "000");
  };

  return (
    <div style={{ position: "relative" }}>
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

      {/* 
        Native input that triggers OS numeric keyboard via inputMode="numeric"
        We use type="text" to allow our formatting dots. 
      */}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        required={required}
        placeholder="0"
        style={{
          width: "100%",
          padding: large ? "14px 16px" : "12px 16px",
          borderRadius: 12,
          background: "var(--surface-2)",
          border: "1.5px solid var(--border)",
          color: "var(--text-primary)",
          fontSize: large ? 26 : 16,
          fontWeight: large ? 800 : 600,
          letterSpacing: "-0.5px",
          transition: "border-color 0.15s",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#6366f1";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
        }}
      />

      {/* Hidden input for standard form submission if needed */}
      <input type="hidden" name={id} value={value} />

      {/* Shortcut bar below the input */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={handleTripleZero}
          disabled={!value || value === "0"}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "rgba(99,102,241,0.1)",
            color: "#6366f1",
            fontSize: 13,
            fontWeight: 700,
            cursor: (!value || value === "0") ? "not-allowed" : "pointer",
            opacity: (!value || value === "0") ? 0.5 : 1,
            transition: "all 0.15s",
          }}
        >
          +000
        </button>
      </div>
    </div>
  );
}
