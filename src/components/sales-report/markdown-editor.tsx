"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2, Save, Eye, Edit } from 'lucide-react'
import { updateReportContent } from '@/app/actions/sales-report'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
  reportId: string
  initialContent: string
  onSave?: () => void
}

export function MarkdownEditor({ reportId, initialContent, onSave }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (content !== initialContent) {
        handleSave()
      }
    }, 30000)

    return () => clearInterval(timer)
  }, [content, initialContent])

  const handleSave = async () => {
    setSaving(true)

    try {
      const result = await updateReportContent(reportId, content)
      
      if (!result.error) {
        setLastSaved(new Date())
        onSave?.()
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'edit' | 'preview')}>
          <TabsList>
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <p className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[600px] p-4 font-mono text-sm border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="# Start writing your report..."
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none min-h-[600px] p-6 border rounded-lg bg-muted/30">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
