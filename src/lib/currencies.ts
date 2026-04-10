export const CURRENCIES = [
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID", flag: "🇮🇩" },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", flag: "🇪🇺" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", flag: "🇸🇬" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY", flag: "🇲🇾" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP", flag: "🇯🇵" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", flag: "🇬🇧" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", flag: "🇦🇺" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN", flag: "🇨🇳" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR", flag: "🇰🇷" },
];

export function getCurrencyInfo(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
