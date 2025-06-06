// components/ui/nav-link.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'transition-colors hover:text-primary',
        isActive ? 'font-bold text-primary' : 'text-muted-foreground',
        className
      )}
    >
      {children}
    </Link>
  );
}
