"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/components/session-provider';
import { ProfileForm } from '@/components/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User as UserIcon, Loader2 } from 'lucide-react';
import { User } from '@prisma/client'; // Assuming you have access to the full User type

export function ProfileModal() {
  const { user: sessionUser } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  // States to manage the data fetching lifecycle
  const [fullUserData, setFullUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This useEffect hook triggers whenever the dialog is opened.
  useEffect(() => {
    // Only fetch data if the dialog is open and we have a user session
    if (isOpen && sessionUser) {
      const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        setFullUserData(null); // Clear old data

        try {
          const res = await fetch(`/api/users/${sessionUser.userId}`);
          
          if (!res.ok) {
            // If the response is not OK, throw an error to be caught below
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch profile data.');
          }

          const data = await res.json();
          // THIS IS THE CRITICAL FIX: Set the state with the fetched user data
          setFullUserData(data.user);

        } catch (err: any) {
          console.error("Profile fetch error:", err);
          setError(err.message || 'An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }
  }, [isOpen, sessionUser]); // Dependencies: re-run when `isOpen` or `sessionUser` changes

  if (!sessionUser) {
    return null; // Don't render the modal trigger if user is not logged in
  }

  // Helper function to render the content based on the state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4">Loading profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center h-40 flex flex-col justify-center items-center text-red-600">
          <p className="font-semibold">Failed to load profile</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (fullUserData) {
      // Pass a callback to the form to close the modal on successful submission
      return <ProfileForm user={fullUserData} />;
    }

    return null; // Should not be reached, but good for safety
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Use a proper DropdownMenuItem which handles focus and keyboard navigation */}
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div
              onClick={() => setIsOpen(true)} // Manually trigger open
              className="flex items-center w-full"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </div>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}