"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Save, Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react'
import { updateReportContent } from '@/app/actions/sales-report'

// Tiptap imports
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { marked } from 'marked'
import TurndownService from 'turndown'

interface MarkdownEditorProps {
  reportId: string
  initialContent: string
  onSave?: () => void
}

export function MarkdownEditor({ reportId, initialContent, onSave }: MarkdownEditorProps) {
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  // Initialize Turndown to convert HTML back to Markdown
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
  })

  // Parse initial Markdown into HTML for Tiptap
  // Using Promise.resolve since marked might be async in newer setups, but sync here is fine for basic markdown
  const initialHtml = typeof marked === 'function' ? marked(initialContent) : marked.parse(initialContent)

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: initialHtml as string,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[600px] p-6 focus:outline-none',
      },
    },
    onUpdate: () => {
      // Handled by auto-save interval
    },
    onCreate: () => {
      setIsEditorReady(true)
    }
  })

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!editor) return

    const timer = setInterval(() => {
      handleSave()
    }, 30000)

    return () => clearInterval(timer)
  }, [editor])

  const handleSave = async () => {
    if (!editor) return
    
    setSaving(true)

    try {
      // Get current HTML from editor and convert back to Markdown
      const html = editor.getHTML()
      const markdown = turndownService.turndown(html)

      // Only save if content actually changed (avoid unnecessary saves)
      if (markdown !== initialContent) {
        const result = await updateReportContent(reportId, markdown)
        
        if (!result.error) {
          setLastSaved(new Date())
          onSave?.()
        }
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  // If editor is not ready, show a subtle loading state or simple container
  if (!editor) {
    return <div className="min-h-[600px] p-6 text-muted-foreground animate-pulse">Loading editor...</div>
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b pb-4">
        
        {/* Formatting Controls */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Save Controls */}
        <div className="flex items-center gap-4">
          {lastSaved && (
            <p className="text-xs text-muted-foreground hidden sm:block">
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

      {/* Tiptap Editor Context */}
      <div className="border rounded-lg bg-card overflow-hidden">
        
        {/* Floating menu shown when typing on an empty line */}
        {isEditorReady && (
          <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-popover shadow-md border rounded-md overflow-hidden p-1">
             <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
             >
                <Heading1 className="h-4 w-4" />
             </Button>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
             >
                <Heading2 className="h-4 w-4" />
             </Button>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
             >
                <List className="h-4 w-4" />
             </Button>
          </FloatingMenu>
        )}

        {/* Bubble menu shown when text is highlighted */}
        {isEditorReady && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-popover shadow-md border rounded-md overflow-hidden p-1">
             <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
             >
                <Bold className="h-4 w-4" />
             </Button>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
             >
                <Italic className="h-4 w-4" />
             </Button>
          </BubbleMenu>
        )}

        {/* Actual editable content area */}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
