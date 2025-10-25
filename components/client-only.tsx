'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering children on the client
  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
