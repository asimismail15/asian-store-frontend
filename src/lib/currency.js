export const supportedCurrencies = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "PKR", symbol: "Rs", label: "Pakistani Rupee" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
];

export async function loadCurrencyRate(currency) {
  if (currency === "USD") return { rate: 1, date: null };
  const response = await fetch(`https://api.frankfurter.dev/v2/rate/usd/${currency.toLowerCase()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load the latest ${currency} exchange rate.`);
  const data = await response.json();
  if (!Number.isFinite(data.rate) || data.rate <= 0) throw new Error(`No current exchange rate is available for ${currency}.`);
  return { rate: data.rate, date: data.date || null };
}
