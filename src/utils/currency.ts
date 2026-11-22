/**
 * Indian Rupee (INR - ₹) currency formatting utilities
 */

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakhs(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(1);
    return `₹${cr.replace(/\.0$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(1);
    return `₹${lk.replace(/\.0$/, '')} Lakh`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }
  return `₹${amount}`;
}
