/**
 * Authentication Context - Manages user auth state
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ml-engineer' | 'data-engineer' | 'prod-team' | 'monitoring-team' | 'model-sponsor';
  teams: string[];
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

/**
 * Role-based permissions
 */
const rolePermissions: Record<string, string[]> = {
  'admin': ['all'],
  'ml-engineer': ['create_pipelines', 'register_models', 'deploy_to_dev', 'view_all'],
  'data-engineer': ['ingest_data', 'prepare_data', 'create_features', 'view_data'],
  'prod-team': ['deploy_to_staging', 'deploy_to_prod', 'approve_promotion', 'view_deployments'],
  'monitoring-team': ['view_monitoring', 'create_alerts', 'acknowledge_alerts'],
  'model-sponsor': ['view_dashboards', 'view_models'],
};

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔐 AuthProvider mounted - checking for stored token');

  // Check if user is already logged in on mount
  useEffect(() => {
    console.log('🔐 AuthProvider useEffect running');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log('🔐 Stored token:', storedToken ? 'YES' : 'NO');
    console.log('🔐 Stored user:', storedUser ? 'YES' : 'NO');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('🔐 Restored user from storage');
        // Don't wait for backend verification - just load from local storage
      } catch (err) {
        console.warn('🔐 Failed to parse stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expired. Please login again.');
      }
    } else {
      console.log('🔐 No stored token/user - user needs to login');
    }
    console.log('🔐 Setting isLoading to false');
    setIsLoading(false);
  }, []);

  const verifyToken = async (token: string) => {
    // Async verification with backend - but doesn't block app loading
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        // Token might be invalid - logout user
        logout();
      }
    } catch (err) {
      // Backend not available - just warn but don't logout
      console.warn('Could not verify token with backend');
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Demo mode - allow login with demo credentials without backend
      if (email === 'admin@mlops.com' && password === 'password') {
        const demoUser: User = {
          id: '1',
          email: 'admin@mlops.com',
          name: 'Admin User',
          role: 'admin',
          teams: ['MLOps'],
          createdAt: new Date().toISOString(),
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return;
      }
      
      // Try to authenticate with backend
      try {
        const response = await authAPI.login(email, password) as any;
        
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          setToken(response.token);
          setUser(response.user);
        } else {
          throw new Error(response.error || 'Login failed');
        }
      } catch (backendErr: any) {
        // If backend is down and not demo credentials, fail
        throw new Error('Backend unavailable. Use demo credentials: admin@mlops.com / password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authAPI.register(data) as any;
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('all') || permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    error,
    login,
    logout,
    register,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Higher-order component for protected routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div className="flex items-center justify-center h-screen">Please login</div>;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Unauthorized: Required role {requiredRole}</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
