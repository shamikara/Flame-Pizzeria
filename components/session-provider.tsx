'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { ChangePasswordForm } from '@/components/change-password-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type UserPayload = {
  phone: string;
  address: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
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
  mustChangePassword?: boolean;
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.mustChangePassword) {
          setShowPasswordModal(true);
        }
      } else {
        setUser(null);
        setShowPasswordModal(false);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
      setShowPasswordModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'include',
      });
      setUser(null);
      setShowPasswordModal(false);
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, isLoading, handleLogout, refreshSession }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner />
            <p className="text-sm font-medium text-foreground">Updating your session...</p>
          </div>
        </div>
      )}
      <Dialog open={showPasswordModal} onOpenChange={(open) => setShowPasswordModal(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Your Password</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm
            onSuccess={async () => {
              setShowPasswordModal(false);
              await refreshSession();
            }}
            forceCurrentPassword={Boolean(user?.mustChangePassword)}
          />
        </DialogContent>
      </Dialog>
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