"use client"

import { useState, useCallback } from 'react'
import { Upload, X, FileText, Video, Music, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatFileSize, isValidFileType } from '@/lib/content-extraction'

interface FileUploadProps {
  workspaceId: string
  offerId: string
  onUploadComplete?: (file: any) => void
}

export function FileUpload({ workspaceId, offerId, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file =>
        isValidFileType(file.type)
      )
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).filter(file =>
        isValidFileType(file.type)
      )
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('workspaceId', workspaceId)
        formData.append('offerId', offerId)

        const response = await fetch('/api/upload-offer-file', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        onUploadComplete?.(result.file)

        setProgress(((i + 1) / files.length) * 100)
      }

      setFiles([])
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />
    if (type === 'application/pdf') return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Upload Your Offer Files</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop files here, or click to browse
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.docx,.doc,.mp4,.mov,.avi,.mp3,.wav,.m4a,.txt"
          onChange={handleFileSelect}
        />
        <Button asChild variant="outline">
          <label htmlFor="file-upload" className="cursor-pointer">
            Browse Files
          </label>
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Supported: PDF, Word, Video (MP4, MOV), Audio (MP3, WAV)
        </p>
      </div>

      {files.length > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            className="w-full mt-4"
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
          </Button>
        </Card>
      )}
    </div>
  )
}
