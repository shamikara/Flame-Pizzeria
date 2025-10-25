"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/components/session-provider';
import { ProfileForm } from '@/components/profile-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Loader2 } from 'lucide-react';
import { User } from '@prisma/client';

interface ProfileModalProps {
  id?: string;
}

export function ProfileModal({ id }: ProfileModalProps) {
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
        setFullUserData(null);

        try {
          const res = await fetch(`/api/users/${sessionUser.userId}`);
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch profile data.');
          }

          const data = await res.json();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => setIsOpen(true)}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : fullUserData ? (
            <ProfileForm 
              user={{
                firstName: fullUserData.firstName || '',
                lastName: fullUserData.lastName || '',
                email: fullUserData.email || '',
                contact: 'contact' in fullUserData ? (fullUserData as any).contact : '',
                address: 'address' in fullUserData ? (fullUserData as any).address : ''
              }} 
              onSuccess={() => setIsOpen(false)}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}