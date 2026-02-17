/**
 * Extract text content from PDF files
 */
export async function extractPDFText(file: File): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default
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
 * Generate summary of extracted content using AI
 */
export async function generateContentSummary(
  content: string,
  apiKey: string
): Promise<string> {
  try {
    // Chunk content if too long (max 4000 tokens ≈ 16000 chars)
    const chunks = chunkText(content, 16000)

    const summaries = await Promise.all(
      chunks.map(chunk => summarizeChunk(chunk, apiKey))
    )

    // If multiple chunks, combine and summarize again
    if (summaries.length > 1) {
      const combined = summaries.join('\n\n')
      return await summarizeChunk(combined, apiKey)
    }

    return summaries[0]
  } catch (error) {
    console.error('Summary generation error:', error)
    throw new Error('Failed to generate summary')
  }
}

/**
 * Summarize a single chunk of text
 */
async function summarizeChunk(text: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract key topics, main points, structure, and important details from the content. Be comprehensive but concise.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`Summary API failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
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
