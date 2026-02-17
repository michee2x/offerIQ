import { createAdminClient } from '@/utils/supabase/admin'

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToStorage(
    file: File,
    workspaceId: string,
    offerId: string
): Promise<{ path: string; error?: string }> {
    try {
        const supabase = createAdminClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${workspaceId}/${offerId}/${fileName}`

        const { data, error } = await supabase.storage
            .from('offer-files')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Storage upload error:', error)
            return { path: '', error: error.message }
        }

        return { path: data.path }
    } catch (error) {
        console.error('Upload error:', error)
        return { path: '', error: 'Failed to upload file' }
    }
}

/**
 * Get signed URL for file download
 */
export async function getSignedDownloadUrl(
    filePath: string,
    expiresIn: number = 3600
): Promise<{ url: string; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase.storage
            .from('offer-files')
            .createSignedUrl(filePath, expiresIn)

        if (error) {
            console.error('Signed URL error:', error)
            return { url: '', error: error.message }
        }

        return { url: data.signedUrl }
    } catch (error) {
        console.error('Get signed URL error:', error)
        return { url: '', error: 'Failed to generate download link' }
    }
}

/**
 * Delete file from storage
 */
export async function deleteFileFromStorage(
    filePath: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase.storage
            .from('offer-files')
            .remove([filePath])

        if (error) {
            console.error('Storage delete error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Failed to delete file' }
    }
}

/**
 * Get public URL for file (if bucket is public)
 */
export function getPublicUrl(filePath: string): string {
    const supabase = createAdminClient()

    const { data } = supabase.storage
        .from('offer-files')
        .getPublicUrl(filePath)

    return data.publicUrl
}

/**
 * List files in a directory
 */
export async function listFiles(
    workspaceId: string,
    offerId?: string
): Promise<{ files: any[]; error?: string }> {
    try {
        const supabase = createAdminClient()
        const path = offerId ? `${workspaceId}/${offerId}` : workspaceId

        const { data, error } = await supabase.storage
            .from('offer-files')
            .list(path)

        if (error) {
            console.error('List files error:', error)
            return { files: [], error: error.message }
        }

        return { files: data || [] }
    } catch (error) {
        console.error('List files error:', error)
        return { files: [], error: 'Failed to list files' }
    }
}
