'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { getSession } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { OfferContext } from '@/types/sales-report'

/**
 * Create or update offer context
 */
export async function saveOfferContext(data: Omit<OfferContext, 'id' | 'created_at' | 'updated_at'>) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        const { data: context, error } = await supabase
            .from('offer_contexts')
            .upsert({
                ...data,
                key_features: data.key_features || []
            })
            .select()
            .single()

        if (error) {
            console.error('Save context error:', error)
            return { error: 'Failed to save offer context' }
        }

        revalidatePath(`/workspace/${data.workspace_id}`)
        return { success: true, context }
    } catch (error) {
        console.error('Save context error:', error)
        return { error: 'Failed to save offer context' }
    }
}

/**
 * Get offer context by ID
 */
export async function getOfferContext(contextId: string) {
    const session = await getSession()
    if (!session?.user) {
        return null
    }

    const supabase = createAdminClient()
    const { data: context } = await supabase
        .from('offer_contexts')
        .select('*')
        .eq('id', contextId)
        .single()

    return context
}

/**
 * Get all offer contexts for a workspace
 */
export async function getWorkspaceOfferContexts(workspaceId: string) {
    const session = await getSession()
    if (!session?.user) {
        return []
    }

    const supabase = createAdminClient()
    const { data: contexts } = await supabase
        .from('offer_contexts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

    return contexts || []
}

/**
 * Delete offer context
 */
export async function deleteOfferContext(contextId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        const { data: context } = await supabase
            .from('offer_contexts')
            .select('workspace_id')
            .eq('id', contextId)
            .single()

        if (!context) {
            return { error: 'Context not found' }
        }

        await supabase
            .from('offer_contexts')
            .delete()
            .eq('id', contextId)

        revalidatePath(`/workspace/${context.workspace_id}`)
        return { success: true }
    } catch (error) {
        console.error('Delete context error:', error)
        return { error: 'Failed to delete context' }
    }
}
