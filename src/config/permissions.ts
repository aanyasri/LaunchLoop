import { UserRole } from '../types/auth';

export interface RoutePermission {
  pathPattern: RegExp;
  allowedRoles: UserRole[];
  friendlyName: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Founder-only routes
  {
    pathPattern: /^\/team(\/.*)?$/,
    allowedRoles: ['FOUNDER'],
    friendlyName: 'Team Finder & Trial Sprints',
  },
  {
    pathPattern: /^\/simulate(\/.*)?$/,
    allowedRoles: ['FOUNDER'],
    friendlyName: 'Idea Simulator',
  },
  {
    pathPattern: /^\/prebook$/,
    allowedRoles: ['FOUNDER'],
    friendlyName: 'Pre-booking Campaign Creator',
  },

  // Company-only routes
  {
    pathPattern: /^\/problems\/new$/,
    allowedRoles: ['ENTERPRISE'],
    friendlyName: 'Post an Enterprise Problem',
  },
  {
    pathPattern: /^\/company(\/.*)?$/,
    allowedRoles: ['ENTERPRISE'],
    friendlyName: 'Company Problem & Proposal Management',
  },

  // Backer-only routes
  {
    pathPattern: /^\/backer(\/.*)?$/,
    allowedRoles: ['BACKER'],
    friendlyName: 'Backer Discovery & Pre-bookings',
  },

  // Shared routes between Founder and Company
  {
    pathPattern: /^\/problems(\/[^/]+)?$/,
    allowedRoles: ['FOUNDER', 'ENTERPRISE'],
    friendlyName: 'Enterprise Problem Board',
  },

  // Shared routes accessible to all authenticated roles
  {
    pathPattern: /^\/dashboard$/,
    allowedRoles: ['FOUNDER', 'ENTERPRISE', 'BACKER'],
    friendlyName: 'Role Dashboard',
  },
];

/**
 * Checks whether a given role is authorized to access a given URL path.
 * Returns true if the route has no specific role restriction or if the role is permitted.
 */
export function canAccessRoute(role: UserRole | undefined, pathname: string): boolean {
  if (!role) return false;

  const matched = ROUTE_PERMISSIONS.find((perm) => perm.pathPattern.test(pathname));
  if (!matched) {
    // If not explicitly restricted (e.g. public pages), allow access
    return true;
  }

  return matched.allowedRoles.includes(role);
}

/**
 * Gets a human-readable message explaining why access was redirected.
 */
export function getAccessDeniedMessage(role: UserRole, targetPath: string): string {
  const matched = ROUTE_PERMISSIONS.find((perm) => perm.pathPattern.test(targetPath));
  const featureName = matched ? matched.friendlyName : 'this page';
  const roleLabel =
    role === 'FOUNDER' ? 'Founder' : role === 'ENTERPRISE' ? 'Company' : 'Backer';

  return `Notice: ${featureName} is not available for ${roleLabel} accounts. You have been redirected to your ${roleLabel} workspace.`;
}
