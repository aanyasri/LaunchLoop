import { Compass, Users, Sparkles, ShoppingBag, LayoutDashboard, PlusCircle, FileText, Search, CreditCard, LucideIcon } from 'lucide-react';
import { UserRole } from '../types/auth';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAVIGATION_BY_ROLE: Record<UserRole, NavItem[]> = {
  FOUNDER: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Problems', href: '/problems', icon: Compass },
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Simulate', href: '/simulate', icon: Sparkles },
    { label: 'Pre-book', href: '/prebook', icon: ShoppingBag },
  ],
  ENTERPRISE: [
    { label: 'Company Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Problems', href: '/company/problems', icon: Compass },
    { label: 'Proposals Received', href: '/company/proposals', icon: FileText },
    { label: 'Post a Problem', href: '/problems/new', icon: PlusCircle, badge: 'New' },
  ],
  BACKER: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover Products', href: '/backer/discover', icon: Search },
    { label: 'My Pre-bookings', href: '/backer/prebookings', icon: CreditCard },
  ],
};

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAVIGATION_BY_ROLE[role] || NAVIGATION_BY_ROLE.FOUNDER;
}
