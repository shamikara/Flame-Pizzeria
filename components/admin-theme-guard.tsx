"use client";

import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/spinner";

export function AdminThemeGuard({ children }: { children: ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    if (resolvedTheme === "dark") {
      const handle = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(handle);
    }
  }, [resolvedTheme]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <span className="text-sm text-white/80">Preparing dashboard...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}