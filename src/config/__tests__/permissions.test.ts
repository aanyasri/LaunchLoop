import { describe, it, expect } from 'vitest';
import { canAccessRoute, getAccessDeniedMessage } from '../permissions';

describe('permissions helper', () => {
  it('allows Founder to access founder pipeline routes but denies company/backer exclusive routes', () => {
    expect(canAccessRoute('FOUNDER', '/team')).toBe(true);
    expect(canAccessRoute('FOUNDER', '/simulate')).toBe(true);
    expect(canAccessRoute('FOUNDER', '/prebook')).toBe(true);
    expect(canAccessRoute('FOUNDER', '/problems')).toBe(true);
    expect(canAccessRoute('FOUNDER', '/problems/new')).toBe(false);
    expect(canAccessRoute('FOUNDER', '/backer/discover')).toBe(false);
  });

  it('allows Enterprise to access company routes and shared problem board but denies founder tools', () => {
    expect(canAccessRoute('ENTERPRISE', '/problems/new')).toBe(true);
    expect(canAccessRoute('ENTERPRISE', '/company/proposals')).toBe(true);
    expect(canAccessRoute('ENTERPRISE', '/problems')).toBe(true);
    expect(canAccessRoute('ENTERPRISE', '/team')).toBe(false);
    expect(canAccessRoute('ENTERPRISE', '/simulate')).toBe(false);
  });

  it('allows Backer to access discovery & prebookings but denies problem creation and founder tools', () => {
    expect(canAccessRoute('BACKER', '/backer/discover')).toBe(true);
    expect(canAccessRoute('BACKER', '/backer/prebookings')).toBe(true);
    expect(canAccessRoute('BACKER', '/team')).toBe(false);
    expect(canAccessRoute('BACKER', '/problems/new')).toBe(false);
  });

  it('generates friendly message when access is denied', () => {
    const msg = getAccessDeniedMessage('FOUNDER', '/problems/new');
    expect(msg).toContain('Post an Enterprise Problem');
    expect(msg).toContain('not available for Founder accounts');
  });
});
