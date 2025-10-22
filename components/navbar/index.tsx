'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import avatar from '/public/img/avatars/avatar4.png';
import { FiAlignJustify } from 'react-icons/fi';
import { useSession } from '@/components/session-provider';

const Navbar = ({
  onOpenSidenav,
  brandText,
}: {
  onOpenSidenav: () => void;
  brandText: string;
}) => {
  const { handleLogout } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } catch (error) {
      console.error('Failed to logout:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-4 z-40 flex items-center justify-between rounded-xl bg-white/10 p-3 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="text-white text-xl font-semibold">
        {brandText}
      </div>

      <div className="flex items-center gap-4">
        {/* Sidebar toggle */}
        <button
          onClick={onOpenSidenav}
          className="text-white text-xl block xl:hidden"
        >
          <FiAlignJustify />
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg shadow"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>

        {/* Avatar */}
        <Image
          src={avatar}
          alt="admin avatar"
          className="rounded-full h-10 w-10"
          width={40}
          height={40}
        />
      </div>
    </nav>
  );
};

export default Navbar;
