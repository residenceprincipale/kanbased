import { router } from '@/main'
import { useSession } from '@/queries/session'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSession()

  if (!session) {
    router.navigate({ to: '/auth/login', replace: true })
    return
  }

  return <Outlet />
}
