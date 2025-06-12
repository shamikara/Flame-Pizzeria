
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { getServerSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login'); 
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      contact: true,
      address: true,
    }
  });

  if (!user) {
    // This case should be rare if a session exists, but it's good practice
    redirect('/login');
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
      <p className="text-muted-foreground">Manage your account settings for <span className="font-semibold text-primary">{user.email}</span>.</p>
      <ProfileForm user={user} />
    </div>
  );
}
