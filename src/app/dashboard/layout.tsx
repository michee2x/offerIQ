import { DashboardHeader } from "@/components/layout/header"
import { DashboardSidebar } from "@/components/layout/sidebar"
import { getWorkspaces } from "@/app/actions/workspace"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const workspaces = await getWorkspaces()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar workspaces={workspaces} />
      <div className="flex flex-col h-screen overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
}
