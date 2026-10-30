// Formats an amount in the given currency code, e.g. "€126.00" or "940,00 kr."
// Intl puts the currency sign before or after the number, as is usual for that currency.
// Pass { wholeNumbers: true } to drop ".00" from round amounts, e.g. "€126"
export function formatMoney(amount, currency, { wholeNumbers = false } = {}) {
  const hideCents = wholeNumbers && Number.isInteger(amount || 0);

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: hideCents ? 0 : undefined,
    maximumFractionDigits: hideCents ? 0 : undefined,
  }).format(amount || 0);
}

// The sign for a currency code, e.g. "EUR" → "€", "GBP" → "£"
export function getCurrencySymbol(currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency").value;
}