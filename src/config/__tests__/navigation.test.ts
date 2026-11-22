import { describe, it, expect } from 'vitest';
import { getNavItemsForRole } from '../navigation';

describe('navigation config', () => {
  it('returns founder pipeline links for FOUNDER role', () => {
    const items = getNavItemsForRole('FOUNDER');
    const labels = items.map((i) => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Problems');
    expect(labels).toContain('Team');
    expect(labels).toContain('Simulate');
    expect(labels).toContain('Pre-book');
  });

  it('returns company innovation links for ENTERPRISE role', () => {
    const items = getNavItemsForRole('ENTERPRISE');
    const labels = items.map((i) => i.label);
    expect(labels).toContain('Company Dashboard');
    expect(labels).toContain('My Problems');
    expect(labels).toContain('Proposals Received');
    expect(labels).toContain('Post a Problem');
  });

  it('returns backer links for BACKER role', () => {
    const items = getNavItemsForRole('BACKER');
    const labels = items.map((i) => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Discover Products');
    expect(labels).toContain('My Pre-bookings');
  });
});
