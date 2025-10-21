import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session'

const roleRedirectMap: Record<string, string> = {
  ADMIN: '/dashboard/overview',
  MANAGER: '/dashboard/overview',
  CHEF: '/dashboard/chef/overview',
  WAITER: '/dashboard/waiter/overview',
  STORE_KEEP: '/dashboard/store-keep/overview',
}

export default async function DashboardRootPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/')
  }

  const destination = roleRedirectMap[session.role] ?? '/dashboard/overview'
  redirect(destination)
}