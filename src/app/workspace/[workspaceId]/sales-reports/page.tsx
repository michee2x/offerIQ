import { getWorkspaceSalesReports } from '@/app/actions/sales-report'
import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function SalesReportsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
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

  const reports = await getWorkspaceSalesReports(workspaceId)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'generating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete'
      case 'generating':
        return 'Generating...'
      case 'draft':
        return 'Draft'
      default:
        return 'Archived'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Reports</h2>
          <p className="text-muted-foreground">
            AI-powered strategic intelligence for your offers
          </p>
        </div>
        <Button asChild>
          <Link href={`/workspace/${workspaceId}/sales-reports/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sales reports yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create your first sales report to get AI-powered strategic insights for your offer.
            </p>
            <Button asChild>
              <Link href={`/workspace/${workspaceId}/sales-reports/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Sales Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  {getStatusIcon(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{getStatusText(report.status)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">v{report.version}</span>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link href={`/workspace/${workspaceId}/sales-reports/${report.id}`}>
                      {report.status === 'complete' ? 'View Report' : 'Continue'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
