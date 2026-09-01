/**
 * Formats a number as Indian Rupee currency using the
 * Indian numbering system (lakh/crore grouping).
 * e.g. formatCurrency(125000) -> "₹1,25,000.00"
 */
export function formatCurrency(value, { decimals = 2, showSymbol = true } = {}) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);

  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Compact currency for KPI cards, e.g. ₹1.2L, ₹3.4Cr
 */
export function formatCurrencyCompact(value) {
  const number = Number(value) || 0;
  const abs = Math.abs(number);

  if (abs >= 1_00_00_000) {
    return `₹${(number / 1_00_00_000).toFixed(2)}Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${(number / 1_00_000).toFixed(2)}L`;
  }
  if (abs >= 1_000) {
    return `₹${(number / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(number, { decimals: 0 });
}

export function formatNumber(value, decimals = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}
