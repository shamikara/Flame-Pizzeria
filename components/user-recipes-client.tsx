'use client';

import { useSession } from 'next-auth/react';
import { UserRecipesContent } from './user-recipes';

export function UserRecipes() {
  const { data: session, status } = useSession();
  
  return (
    <UserRecipesContent session={session} status={status} />
  );
}
