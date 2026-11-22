import { describe, it, expect } from 'vitest';
import { formatINR, formatLakhs } from '../currency';

describe('currency utils', () => {
  it('formats standard INR with currency symbol and Indian grouping', () => {
    const formatted = formatINR(500000);
    // Should contain ₹ and 5,00,000
    expect(formatted).toContain('5,00,000');
    expect(formatted).toContain('₹');
  });

  it('formats numbers into Lakhs and Crores cleanly', () => {
    expect(formatLakhs(500000)).toBe('₹5 Lakh');
    expect(formatLakhs(2500000)).toBe('₹25 Lakh');
    expect(formatLakhs(15000000)).toBe('₹1.5 Cr');
    expect(formatLakhs(45000)).toBe('₹45k');
    expect(formatLakhs(499)).toBe('₹499');
  });
});
