'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserPayload = {
  phone: string;
  address: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role:
    | 'ADMIN'
    | 'MANAGER'
    | 'CHEF'
    | 'WAITER'
    | 'STORE_KEEP'
    | 'DELIVERY_PERSON'
    | 'KITCHEN_HELPER'
    | 'STAFF'
    | 'CUSTOMER';
};

export type SessionUser = UserPayload;
export type SessionUserRole = SessionUser['role'];

type SessionContextType = {
  user: SessionUser | null;
  isLoading: boolean;
  handleLogout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ 
      user, 
      isLoading,
      handleLogout,
      refreshSession
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}