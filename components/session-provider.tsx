// components/session-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { UserPayload } from '@/lib/session';
import { Loader2 } from 'lucide-react';

interface SessionContextType {
  user: UserPayload | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    console.log('[SessionProvider] useEffect triggered by path change:', pathname);
    
    async function fetchSession() {
      console.log('[SessionProvider] Fetching /api/auth/session...');
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        
        console.log(`[SessionProvider] API response Status: ${res.status}`);

        if (res.ok) {
          const data = await res.json();
          console.log('[SessionProvider] API response Data:', data);
          
          if (data.user) {
            console.log('[SessionProvider] User found in data. Setting user state.');
            setUser(data.user);
          } else {
            console.log('[SessionProvider] No user object in data. Setting user to null.');
            setUser(null);
          }
        } else {
          console.log('[SessionProvider] Response not OK. Setting user to null.');
          setUser(null);
        }
      } catch (error) {
        console.error('[SessionProvider] Fetch failed:', error);
        setUser(null);
      } finally {
        if (isLoading) {
          setIsLoading(false);
        }
      }
    }

    fetchSession();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}