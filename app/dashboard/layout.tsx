// // app/dashboard/layout.tsx
// 'use client'

// import DashboardLayout from '@/components/DashboardLayout'

// export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
//   return <DashboardLayout>{children}</DashboardLayout>
// }
//add new
// app/dashboard/layout.tsx
// This is now a Server Component by default

import DashboardLayoutComponent from '@/components/DashboardLayout';
import { getSession, UserPayload } from '@/lib/session';
import { redirect } from 'next/navigation';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Fetch the session data on the server
  const user = getSession();

  // If there's no user session, the middleware should have already redirected.
  // This is an extra layer of protection.
  if (!user) {
    redirect('/login');
  }

  // Pass the user data to the client component that renders the layout
  return (
    <DashboardLayoutComponent user={user}>
      {children}
    </DashboardLayoutComponent>
  );
}