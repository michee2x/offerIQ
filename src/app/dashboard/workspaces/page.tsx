import { getWorkspaces } from "@/app/actions/workspace"
import { WorkspaceCard } from "@/components/workspace/workspace-card"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"

export default async function WorkspacesPage() {
  const workspaces = await getWorkspaces()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Workspaces</h2>
          <p className="text-muted-foreground">
            View and manage all your workspaces
          </p>
        </div>
        <CreateWorkspaceDialog />
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first workspace to start building sales pages and funnels.
            </p>
            <CreateWorkspaceDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  )
}
