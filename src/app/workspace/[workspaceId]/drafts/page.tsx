import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FilePenLine, Plus, FileText, Image, Video } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DraftsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
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

  // TODO: Fetch drafts from database
  const drafts = {
    salesCopy: [],
    images: [],
    videos: [],
  }

  const DraftEmptyState = ({ icon: Icon, title, description }: any) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          {description}
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Draft
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drafts</h2>
          <p className="text-muted-foreground">
            Manage your work-in-progress content and assets
          </p>
        </div>
      </div>

      <Tabs defaultValue="sales-copy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales-copy">Sales Copy</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales-copy" className="space-y-4">
          {drafts.salesCopy.length === 0 ? (
            <DraftEmptyState
              icon={FileText}
              title="No sales copy drafts"
              description="Save your sales copy drafts here to continue working on them later."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Sales copy drafts will be displayed here */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          {drafts.images.length === 0 ? (
            <DraftEmptyState
              icon={Image}
              title="No image drafts"
              description="Upload and manage images for your sales pages and funnels."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Image drafts will be displayed here */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          {drafts.videos.length === 0 ? (
            <DraftEmptyState
              icon={Video}
              title="No video drafts"
              description="Upload and manage videos for your sales content."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Video drafts will be displayed here */}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
