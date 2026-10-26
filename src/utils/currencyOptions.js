// The currencies a wardrobe can use. Signup and the currency settings page share this list.
// - blazerPrice: the same wool blazer in each currency, used for the examples
// - symbolAfter: the sign is written after the number, e.g. "31.33 kr" instead of "kr31.33"
// - perEuro: how much of this currency 1 euro buys, used to convert prices

// Exchange rates saved on 26 Oct 2026 (European Central Bank reference rates).
// They don't update by themselves, change the perEuro numbers below to use newer rates
export const RATES_DATE = "26 Oct 2026";

export const currencyOptions = [
  { code: "EUR", label: "Euro (€)", symbol: "€", example: "e.g. €126 blazer, €4.20 per wear", blazerPrice: 126, perEuro: 1 },
  { code: "DKK", label: "Danish krone (kr)", symbol: "kr", example: "e.g. 940 kr blazer, 31 kr per wear", blazerPrice: 940, symbolAfter: true, perEuro: 7.4747 },
  { code: "GBP", label: "British pound (£)", symbol: "£", example: "e.g. £108 blazer, £3.60 per wear", blazerPrice: 108, perEuro: 0.8382 },
  { code: "USD", label: "US dollar ($)", symbol: "$", example: "e.g. $137 blazer, $4.57 per wear", blazerPrice: 137, perEuro: 1.1188 },
  { code: "CZK", label: "Czech koruna (Kč)", symbol: "Kč", example: "e.g. 3,150 Kč blazer, 105 Kč per wear", blazerPrice: 3150, symbolAfter: true, perEuro: 24.369 },
  { code: "SEK", label: "Swedish krona (kr)", symbol: "kr", example: "e.g. 1,449 kr blazer, 48.30 kr per wear", blazerPrice: 1449, symbolAfter: true, perEuro: 11.1385 },
];

// Finds a currency by its code, e.g. "DKK". Falls back to the first one (euro)
export function findCurrency(code) {
  return currencyOptions.find((option) => option.code === code) ?? currencyOptions[0];
}

// Converts an amount between two currencies using the saved rates, e.g. 126 EUR → 941.81 DKK.
// Goes through euros: first to euros, then to the new currency. Rounded to 2 decimals
export function convertAmount(amount, fromCode, toCode) {
  const euros = amount / findCurrency(fromCode).perEuro;
  const converted = euros * findCurrency(toCode).perEuro;
  return Math.round(converted * 100) / 100;
}