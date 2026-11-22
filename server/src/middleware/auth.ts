import { Request, Response, NextFunction } from 'express';

export type UserRole = 'FOUNDER' | 'ENTERPRISE' | 'BACKER';

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  organization?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Demo Authentication Middleware:
 * Inspects Authorization: Bearer <token> or X-User-Role header and maps it to a demo role.
 * IMPORTANT: This is demo auth designed for frontend prototyping, not production auth.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers['x-user-role'] as string | undefined;

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (roleHeader) {
    token = roleHeader.trim();
  }

  if (token) {
    const tokenLower = token.toLowerCase();
    if (tokenLower.includes('enterprise') || tokenLower.includes('company')) {
      req.user = {
        id: 'usr_ent_01',
        role: 'ENTERPRISE',
        name: 'Vikramaditya Roy',
        email: 'vikramaditya@mahindralogistics.demo',
        organization: 'Mahindra Logistics Innovation Hub',
      };
    } else if (tokenLower.includes('backer')) {
      req.user = {
        id: 'usr_backer_01',
        role: 'BACKER',
        name: 'Vikram Joshi',
        email: 'vikram.j@outlook.com',
      };
    } else {
      // Default to Founder
      req.user = {
        id: 'usr_founder_01',
        role: 'FOUNDER',
        name: 'Aanya Sharma',
        email: 'aanya@agricold.demo',
      };
    }
  }

  next();
}

/**
 * Role-guard middleware that strictly checks if the authenticated user has one of the allowed roles.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Demo session token required in Authorization header (e.g. Bearer mock-session-token-founder-1)',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Only ${allowedRoles.join(' or ')} accounts may perform this action. You are signed in as ${req.user.role}.`,
      });
      return;
    }

    next();
  };
}
