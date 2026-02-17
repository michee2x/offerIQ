import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Workflow, Plus } from "lucide-react"

export default async function FunnelsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const supabase = createAdminClient()
  
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    notFound()
  }

  // TODO: Fetch funnels from database
  const funnels: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Funnels</h2>
          <p className="text-muted-foreground">
            Build complete sales funnels to guide customers through your offer
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Funnel
        </Button>
      </div>

      {funnels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No funnels yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create your first funnel to build a complete customer journey from awareness to purchase.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Funnel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Funnels will be displayed here */}
        </div>
      )}
    </div>
  )
}
