import { getSalesReport } from '@/app/actions/sales-report'
import { notFound } from 'next/navigation'
import { MarkdownEditor } from '@/components/sales-report/markdown-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import Link from 'next/link'

export default async function SalesReportDetailPage({
  params
}: {
  params: Promise<{ workspaceId: string; reportId: string }>
}) {
  const { workspaceId, reportId } = await params
  const report = await getSalesReport(reportId)

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/workspace/${workspaceId}/sales-reports`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{report.title}</h2>
            <p className="text-sm text-muted-foreground">
              Version {report.version} • {report.status}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {report.status === 'generating' ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Report...</h3>
            <p className="text-sm text-muted-foreground">
              This usually takes 2-5 minutes. You can leave this page and come back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sales Report</CardTitle>
            <CardDescription>
              Edit your report directly or use the AI assistant to refine sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownEditor
              reportId={reportId}
              initialContent={report.content || ''}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
