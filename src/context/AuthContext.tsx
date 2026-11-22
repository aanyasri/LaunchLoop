import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthSession } from '../types/auth';

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_USERS: Record<UserRole, User> = {
  FOUNDER: {
    id: 'usr_founder_01',
    name: 'Aanya Sharma',
    email: 'aanya@launchloop.in',
    role: 'FOUNDER',
    headline: 'Founder @ AgriCold | Ex-B2B Logistics PM',
    organization: 'AgriCold Technologies',
  },
  ENTERPRISE: {
    id: 'usr_ent_01',
    name: 'Rajesh Singhania',
    email: 'rajesh@maharashtra-agricorp.com',
    role: 'ENTERPRISE',
    headline: 'VP Innovation & Procurement',
    organization: 'MahaAgro Logistics Corp',
  },
  BACKER: {
    id: 'usr_backer_01',
    name: 'Vikram Joshi',
    email: 'vikram.j@outlook.com',
    role: 'BACKER',
    headline: 'Independent Distributor & Retailer',
    organization: 'Joshi Agro Mart',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'launchloop_mock_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        // Only load safe mock token, no sensitive passwords or PII
        setUser(session.user);
        setSessionToken(session.mockToken);
      } else {
        // Default to founder session for smooth evaluation
        const defaultUser = DEFAULT_USERS.FOUNDER;
        const mockToken = `mock_jwt_${Date.now()}`;
        setUser(defaultUser);
        setSessionToken(mockToken);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: defaultUser, mockToken }));
      }
    } catch {
      setUser(DEFAULT_USERS.FOUNDER);
      setSessionToken('mock_jwt_fallback');
    }
  }, []);

  const login = (role: UserRole = 'FOUNDER') => {
    const selectedUser = DEFAULT_USERS[role];
    const token = `mock_jwt_${Date.now()}`;
    setUser(selectedUser);
    setSessionToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: selectedUser, mockToken: token }));
  };

  const logout = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
