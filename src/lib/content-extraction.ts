/**
 * Extract text content from PDF files
 */
export async function extractPDFText(file: File): Promise<string> {
  try {
    const pdfParse = require('pdf-parse')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract PDF text')
  }
}

/**
 * Extract text from Word documents (.docx)
 */
export async function extractWordText(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()

    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Word extraction error:', error)
    throw new Error('Failed to extract Word document text')
  }
}

/**
 * Transcribe audio/video using OpenAI Whisper API
 */
export async function transcribeAudio(
  fileUrl: string,
  apiKey: string
): Promise<{
  text: string
  segments?: Array<{ start: number; end: number; text: string }>
}> {
  try {
    const formData = new FormData()

    // Fetch the file from URL
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    formData.append('file', blob, 'audio.mp3')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')

    const transcriptionResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      }
    )

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`)
    }

    const data = await transcriptionResponse.json()

    return {
      text: data.text,
      segments: data.segments?.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text
      }))
    }
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error('Failed to transcribe audio')
  }
}

/**
 * Chunk text into smaller pieces
 */
function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = []
  let currentChunk = ''

  const paragraphs = text.split('\n\n')

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }

      // If single paragraph is too long, split by sentences
      if (paragraph.length > maxChars) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph]
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxChars) {
            if (currentChunk) {
              chunks.push(currentChunk.trim())
            }
            currentChunk = sentence
          } else {
            currentChunk += sentence
          }
        }
      } else {
        currentChunk = paragraph
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/**
 * Determine file type category
 */
export function getFileCategory(mimeType: string): 'video' | 'audio' | 'pdf' | 'document' | 'other' {
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'document'
  }
  return 'other'
}

/**
 * Validate file type for upload
 */
export function isValidFileType(mimeType: string): boolean {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'text/plain'
  ]

  return validTypes.some(type => mimeType.includes(type))
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
