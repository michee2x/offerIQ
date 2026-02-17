import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Workflow, FilePenLine, TrendingUp, Users, Clock } from "lucide-react"
import Link from "next/link"

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
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

  // Placeholder stats - in a real app, fetch from database
  const stats = [
    { name: "Sales Pages", value: "0", icon: FileText, href: `/workspace/${workspaceId}/sales-pages` },
    { name: "Funnels", value: "0", icon: Workflow, href: `/workspace/${workspaceId}/funnels` },
    { name: "Drafts", value: "0", icon: FilePenLine, href: `/workspace/${workspaceId}/drafts` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{workspace.name}</h2>
        <p className="text-muted-foreground">
          Welcome to your workspace. Create and manage your sales content here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button asChild variant="link" className="px-0 mt-2">
                <Link href={stat.href}>View all →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with creating your sales content</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href={`/workspace/${workspaceId}/sales-pages`}>
              <FileText className="h-6 w-6 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Create Sales Page</div>
                <div className="text-sm text-muted-foreground">Build a high-converting sales page</div>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
            <Link href={`/workspace/${workspaceId}/funnels`}>
              <Workflow className="h-6 w-6 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Build Funnel</div>
                <div className="text-sm text-muted-foreground">Create a complete sales funnel</div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity yet. Start creating content to see your activity here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
