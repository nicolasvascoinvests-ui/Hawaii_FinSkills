import { formatCurrency, formatPercent } from '../lib/format';

describe('format helpers', () => {
  it('formats whole-dollar currency', () => {
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(1234)).toBe('$1,234');
    expect(formatCurrency(50000)).toBe('$50,000');
  });

  it('formats percentages', () => {
    expect(formatPercent(42.5)).toBe('42.5%');
    expect(formatPercent(100, 0)).toBe('100%');
  });
});
