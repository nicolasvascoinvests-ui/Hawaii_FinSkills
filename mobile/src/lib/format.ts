export function formatCurrency(n: number, fractionDigits = 0): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(n: number, fractionDigits = 1): string {
  return `${n.toFixed(fractionDigits)}%`;
}
