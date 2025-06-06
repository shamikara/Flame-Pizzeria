'use client'

import { HiX } from 'react-icons/hi'
import Links from './components/Links'
import { IRoute } from '@/types/navigation'

type SidebarProps = {
  routes: IRoute[]
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Sidebar({ routes, open, setOpen }: SidebarProps) {
  return (
    <div
      className={`fixed z-50 flex min-h-full flex-col bg-white pb-10 shadow-lg dark:bg-navy-800 dark:text-white transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Close button for mobile */}
      <span
        className="absolute right-4 top-4 cursor-pointer md:hidden"
        onClick={() => setOpen(false)}
      >
        <HiX className="h-6 w-6" />
      </span>

      {/* Brand */}
      <div className="mt-6 mb-4 flex justify-center text-2xl font-bold text-navy-700 dark:text-white">
        Admin Panel
      </div>

      {/* Divider */}
      <div className="mb-6 border-b border-gray-300 dark:border-white/20" />

      {/* Navigation Links */}
      <ul className="px-4 space-y-2">
        <Links routes={routes} />
      </ul>
    </div>
  )
}
