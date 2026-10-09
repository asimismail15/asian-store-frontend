export const shippingDestinations = [
  { country: "Pakistan", flag: "\u{1f1f5}\u{1f1f0}", region: "South Asia", currency: "PKR", currencyName: "Pakistani Rupee", delivery: "2-5 business days", baseRate: 400, perKgRate: 100 },
  { country: "India", flag: "\u{1f1ee}\u{1f1f3}", region: "South Asia", currency: "INR", currencyName: "Indian Rupee", delivery: "4-8 business days", baseRate: 650, perKgRate: 175 },
  { country: "Japan", flag: "\u{1f1ef}\u{1f1f5}", region: "East Asia", currency: "JPY", currencyName: "Japanese Yen", delivery: "5-9 business days", baseRate: 1200, perKgRate: 350 },
  { country: "China", flag: "\u{1f1e8}\u{1f1f3}", region: "East Asia", currency: "CNY", currencyName: "Chinese Yuan", delivery: "5-10 business days", baseRate: 60, perKgRate: 18 },
  { country: "South Korea", flag: "\u{1f1f0}\u{1f1f7}", region: "East Asia", currency: "KRW", currencyName: "South Korean Won", delivery: "5-9 business days", baseRate: 15000, perKgRate: 4500 },
  { country: "Bangladesh", flag: "\u{1f1e7}\u{1f1e9}", region: "South Asia", currency: "BDT", currencyName: "Bangladeshi Taka", delivery: "3-7 business days", baseRate: 500, perKgRate: 140 },
  { country: "Thailand", flag: "\u{1f1f9}\u{1f1ed}", region: "Southeast Asia", currency: "THB", currencyName: "Thai Baht", delivery: "5-9 business days", baseRate: 350, perKgRate: 100 },
  { country: "United Arab Emirates", flag: "\u{1f1e6}\u{1f1ea}", region: "Middle East", currency: "AED", currencyName: "UAE Dirham", delivery: "3-6 business days", baseRate: 25, perKgRate: 8 },
  { country: "Saudi Arabia", flag: "\u{1f1f8}\u{1f1e6}", region: "Middle East", currency: "SAR", currencyName: "Saudi Riyal", delivery: "4-7 business days", baseRate: 30, perKgRate: 9 },
  { country: "Turkey", flag: "\u{1f1f9}\u{1f1f7}", region: "West Asia", currency: "TRY", currencyName: "Turkish Lira", delivery: "5-9 business days", baseRate: 180, perKgRate: 50 },
  { country: "Qatar", flag: "\u{1f1f6}\u{1f1e6}", region: "Middle East", currency: "QAR", currencyName: "Qatari Riyal", delivery: "3-6 business days", baseRate: 28, perKgRate: 8 },
  { country: "Kuwait", flag: "\u{1f1f0}\u{1f1fc}", region: "Middle East", currency: "KWD", currencyName: "Kuwaiti Dinar", delivery: "4-7 business days", baseRate: 2.5, perKgRate: 0.8 },
  { country: "United Kingdom", flag: "\u{1f1ec}\u{1f1e7}", region: "Europe", currency: "GBP", currencyName: "British Pound", delivery: "5-9 business days", baseRate: 8, perKgRate: 2 },
  { country: "United States", flag: "\u{1f1fa}\u{1f1f8}", region: "North America", currency: "USD", currencyName: "US Dollar", delivery: "6-10 business days", baseRate: 12, perKgRate: 3 },
  { country: "Canada", flag: "\u{1f1e8}\u{1f1e6}", region: "North America", currency: "CAD", currencyName: "Canadian Dollar", delivery: "6-11 business days", baseRate: 16, perKgRate: 4 },
  { country: "Australia", flag: "\u{1f1e6}\u{1f1fa}", region: "Oceania", currency: "AUD", currencyName: "Australian Dollar", delivery: "7-12 business days", baseRate: 20, perKgRate: 5 },
];

export const shippingCountries = shippingDestinations.map(({ country }) => country);

export const shippingRegions = [...new Set(shippingDestinations.map(({ region }) => region))].map((name) => ({
  name,
  countries: shippingDestinations.filter((destination) => destination.region === name).map(({ country }) => country),
}));



