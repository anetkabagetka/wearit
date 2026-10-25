// Formats an amount in the given currency code, e.g. "€126.00" or "940,00 kr."
// Intl puts the currency sign before or after the number, as is usual for that currency
export function formatMoney(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount || 0);
}
