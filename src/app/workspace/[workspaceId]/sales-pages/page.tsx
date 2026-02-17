import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"

export default async function SalesPagesPage({ params }: { params: Promise<{ workspaceId: string }> }) {
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

  // TODO: Fetch sales pages from database
  const salesPages: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Pages</h2>
          <p className="text-muted-foreground">
            Create and manage high-converting sales pages
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Sales Page
        </Button>
      </div>

      {salesPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sales pages yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create your first sales page to start converting visitors into customers.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Sales Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Sales pages will be displayed here */}
        </div>
      )}
    </div>
  )
}
