import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar"
import { WorkspaceHeader } from "@/components/layout/workspace-header"
import { getWorkspaces } from "@/app/actions/workspace"
import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const workspaces = await getWorkspaces()
  
  // Fetch current workspace details
  const supabase = createAdminClient()
  const { data: currentWorkspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (!currentWorkspace) {
    notFound()
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <WorkspaceSidebar workspaces={workspaces} currentWorkspace={currentWorkspace} />
      <div className="flex flex-col h-screen overflow-hidden">
        <WorkspaceHeader workspaceName={currentWorkspace.name} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
}
