'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { getSession } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { uploadFileToStorage, getSignedDownloadUrl } from '@/lib/storage'
import {
    extractPDFText,
    extractWordText,
    transcribeAudio,
    generateContentSummary,
    getFileCategory
} from '@/lib/content-extraction'
import type { OfferFile, ExtractionStatus } from '@/types/sales-report'

/**
 * Upload and process offer file
 */
export async function uploadOfferFile(formData: FormData) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const file = formData.get('file') as File
        const workspaceId = formData.get('workspaceId') as string
        const offerId = formData.get('offerId') as string

        if (!file || !workspaceId || !offerId) {
            return { error: 'Missing required fields' }
        }

        // Upload to storage
        const { path, error: uploadError } = await uploadFileToStorage(
            file,
            workspaceId,
            offerId
        )

        if (uploadError) {
            return { error: uploadError }
        }

        // Save file record to database
        const supabase = createAdminClient()
        const { data: fileRecord, error: dbError } = await supabase
            .from('offer_files')
            .insert({
                workspace_id: workspaceId,
                offer_id: offerId,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: path,
                extraction_status: 'pending'
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            return { error: 'Failed to save file record' }
        }

        // Trigger background processing
        // In production, use a job queue like Inngest or BullMQ
        processFileExtraction(fileRecord.id).catch(console.error)

        revalidatePath(`/workspace/${workspaceId}`)
        return { success: true, file: fileRecord }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload file' }
    }
}

/**
 * Process file extraction in background
 */
async function processFileExtraction(fileId: string) {
    const supabase = createAdminClient()

    try {
        // Update status to processing
        await supabase
            .from('offer_files')
            .update({ extraction_status: 'processing' })
            .eq('id', fileId)

        // Get file record
        const { data: file } = await supabase
            .from('offer_files')
            .select('*')
            .eq('id', fileId)
            .single()

        if (!file) {
            throw new Error('File not found')
        }

        // Get signed URL for processing
        const { url } = await getSignedDownloadUrl(file.storage_path, 7200) // 2 hours

        const category = getFileCategory(file.file_type)
        let extractedContent = ''
        let metadata: any = {}

        // Extract content based on file type
        if (category === 'pdf') {
            // For PDF, we need to fetch and process
            const response = await fetch(url)
            const blob = await response.blob()
            const pdfFile = new File([blob], file.file_name, { type: file.file_type })
            extractedContent = await extractPDFText(pdfFile)
            metadata.pages = extractedContent.split('\n\n').length
        } else if (category === 'document') {
            const response = await fetch(url)
            const blob = await response.blob()
            const docFile = new File([blob], file.file_name, { type: file.file_type })
            extractedContent = await extractWordText(docFile)
        } else if (category === 'video' || category === 'audio') {
            const apiKey = process.env.OPENAI_API_KEY
            if (!apiKey) {
                throw new Error('OpenAI API key not configured')
            }

            const transcription = await transcribeAudio(url, apiKey)
            extractedContent = transcription.text
            metadata.transcriptSegments = transcription.segments

            if (transcription.segments && transcription.segments.length > 0) {
                const lastSegment = transcription.segments[transcription.segments.length - 1]
                metadata.duration = Math.round(lastSegment.end)
            }
        }

        // Generate summary using Gemini
    let summary = ''
    if (extractedContent) {
      const { generateContentSummary } = await import('@/lib/report-generation')
      summary = await generateContentSummary(extractedContent)
    }

        // Update file record with extracted content
        await supabase
            .from('offer_files')
            .update({
                extraction_status: 'complete',
                extracted_content: extractedContent,
                summary: summary,
                metadata: metadata
            })
            .eq('id', fileId)

    } catch (error) {
        console.error('Extraction error:', error)

        // Update status to failed
        await supabase
            .from('offer_files')
            .update({ extraction_status: 'failed' })
            .eq('id', fileId)
    }
}

/**
 * Get files for an offer
 */
export async function getOfferFiles(offerId: string) {
    const session = await getSession()
    if (!session?.user) {
        return []
    }

    const supabase = createAdminClient()
    const { data: files } = await supabase
        .from('offer_files')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false })

    return files || []
}

/**
 * Delete offer file
 */
export async function deleteOfferFile(fileId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        // Get file to delete from storage
        const { data: file } = await supabase
            .from('offer_files')
            .select('storage_path, workspace_id')
            .eq('id', fileId)
            .single()

        if (!file) {
            return { error: 'File not found' }
        }

        // Delete from storage
        const { deleteFileFromStorage } = await import('@/lib/storage')
        await deleteFileFromStorage(file.storage_path)

        // Delete from database
        await supabase
            .from('offer_files')
            .delete()
            .eq('id', fileId)

        revalidatePath(`/workspace/${file.workspace_id}`)
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { error: 'Failed to delete file' }
    }
}
