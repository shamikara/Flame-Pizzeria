// components/profile-modal.tsx
'use client';

import { useState } from 'react';
import { useSession } from '@/components/session-provider';
import { ProfileForm } from '@/components/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User as UserIcon } from 'lucide-react';
import { User } from '@prisma/client'; // Assuming you have access to the full User type
import { Button } from './ui/button';

export function ProfileModal() {
  const { user: sessionUser } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  // This state will hold the full user data we fetch from the DB
  const [fullUserData, setFullUserData] = useState<User | null>(null);

// components/profile-modal.tsx

const handleOpen = async () => {
    if (!sessionUser) return;
    try {
      const res = await fetch(`/api/users/${sessionUser.userId}`);
      if (res.ok) {
        // ... this part is not being reached
      } else {
        // THIS IS LIKELY BEING REACHED, BUT IT DOESN'T TELL US WHY
        console.error('Failed to fetch user data for profile.');
      }
    } catch (error) {
      // OR THIS IS BEING REACHED
      console.error(error); 
    }
  };

  if (!sessionUser) return null; // Don't render anything if not logged in

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* We use a DropdownMenuItem styled component that will trigger the dialog */}
        <button
          onClick={handleOpen}
          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        {fullUserData ? (
          <ProfileForm user={fullUserData} />
        ) : (
          <p>Loading profile...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}