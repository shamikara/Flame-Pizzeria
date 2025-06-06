'use client';
import React from 'react';
import Image from 'next/image';
import avatar from '/public/img/avatars/avatar4.png';
import { FiAlignJustify } from 'react-icons/fi';
import { logout } from '@/lib/logout';

const Navbar = ({
  onOpenSidenav,
  brandText,
}: {
  onOpenSidenav: () => void;
  brandText: string;
}) => {
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
          onClick={logout}
          className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
        >
          Logout
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
