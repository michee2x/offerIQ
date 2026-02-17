'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { getSession } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateSalesReport } from '@/lib/report-generation'
import type { SalesReport, ReportStatus } from '@/types/sales-report'

/**
 * Create a new sales report
 */
export async function createSalesReport(data: {
    workspaceId: string
    offerId: string
    title: string
}) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        const { data: report, error } = await supabase
            .from('sales_reports')
            .insert({
                workspace_id: data.workspaceId,
                offer_id: data.offerId,
                title: data.title,
                status: 'draft',
                content: '',
                metadata: { sections: {} }
            })
            .select()
            .single()

        if (error) {
            console.error('Create report error:', error)
            return { error: 'Failed to create sales report' }
        }

        revalidatePath(`/workspace/${data.workspaceId}`)
        return { success: true, report }
    } catch (error) {
        console.error('Create report error:', error)
        return { error: 'Failed to create sales report' }
    }
}

/**
 * Generate sales report content using AI
 */
export async function generateReportContent(reportId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        // Get report
        const { data: report } = await supabase
            .from('sales_reports')
            .select('*')
            .eq('id', reportId)
            .single()

        if (!report) {
            return { error: 'Report not found' }
        }

        // Get offer context
        const { data: context } = await supabase
            .from('offer_contexts')
            .select('*')
            .eq('id', report.offer_id)
            .single()

        if (!context) {
            return { error: 'Offer context not found' }
        }

        // Get file summaries
        const { data: files } = await supabase
            .from('offer_files')
            .select('summary')
            .eq('offer_id', report.offer_id)
            .eq('extraction_status', 'complete')

        const summaries = files?.map(f => f.summary).filter(Boolean) || []

        // Update status to generating
        await supabase
            .from('sales_reports')
            .update({ status: 'generating' })
            .eq('id', reportId)

        // Generate report using Gemini
        const content = await generateSalesReport(context, summaries)

        // Save report content
        await supabase
            .from('sales_reports')
            .update({
                content,
                status: 'complete',
                metadata: {
                    sections: Object.fromEntries(
                        Object.keys(require('@/types/sales-report').SECTION_METADATA).map(key => [
                            key,
                            { status: 'complete', lastUpdated: new Date().toISOString() }
                        ])
                    )
                }
            })
            .eq('id', reportId)

        // Create version
        await supabase
            .from('report_versions')
            .insert({
                report_id: reportId,
                version: report.version,
                content
            })

        revalidatePath(`/workspace/${report.workspace_id}`)
        return { success: true, content }
    } catch (error) {
        console.error('Generate report error:', error)

        // Update status to draft on error
        const supabase = createAdminClient()
        await supabase
            .from('sales_reports')
            .update({ status: 'draft' })
            .eq('id', reportId)

        return { error: 'Failed to generate report' }
    }
}

/**
 * Update sales report content
 */
export async function updateReportContent(reportId: string, content: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        const { data: report } = await supabase
            .from('sales_reports')
            .select('workspace_id, version')
            .eq('id', reportId)
            .single()

        if (!report) {
            return { error: 'Report not found' }
        }

        await supabase
            .from('sales_reports')
            .update({ content })
            .eq('id', reportId)

        revalidatePath(`/workspace/${report.workspace_id}`)
        return { success: true }
    } catch (error) {
        console.error('Update report error:', error)
        return { error: 'Failed to update report' }
    }
}

/**
 * Get sales report by ID
 */
export async function getSalesReport(reportId: string) {
    const session = await getSession()
    if (!session?.user) {
        return null
    }

    const supabase = createAdminClient()
    const { data: report } = await supabase
        .from('sales_reports')
        .select('*')
        .eq('id', reportId)
        .single()

    return report
}

/**
 * Get all sales reports for a workspace
 */
export async function getWorkspaceSalesReports(workspaceId: string) {
    const session = await getSession()
    if (!session?.user) {
        return []
    }

    const supabase = createAdminClient()
    const { data: reports } = await supabase
        .from('sales_reports')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

    return reports || []
}

/**
 * Delete sales report
 */
export async function deleteSalesReport(reportId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        const { data: report } = await supabase
            .from('sales_reports')
            .select('workspace_id')
            .eq('id', reportId)
            .single()

        if (!report) {
            return { error: 'Report not found' }
        }

        await supabase
            .from('sales_reports')
            .delete()
            .eq('id', reportId)

        revalidatePath(`/workspace/${report.workspace_id}`)
        return { success: true }
    } catch (error) {
        console.error('Delete report error:', error)
        return { error: 'Failed to delete report' }
    }
}

/**
 * Create a new version of the report
 */
export async function createReportVersion(reportId: string) {
    const session = await getSession()
    if (!session?.user) {
        redirect('/login')
    }

    try {
        const supabase = createAdminClient()

        const { data: report } = await supabase
            .from('sales_reports')
            .select('*')
            .eq('id', reportId)
            .single()

        if (!report) {
            return { error: 'Report not found' }
        }

        const newVersion = report.version + 1

        // Save current version
        await supabase
            .from('report_versions')
            .insert({
                report_id: reportId,
                version: report.version,
                content: report.content
            })

        // Update report version
        await supabase
            .from('sales_reports')
            .update({ version: newVersion })
            .eq('id', reportId)

        revalidatePath(`/workspace/${report.workspace_id}`)
        return { success: true, version: newVersion }
    } catch (error) {
        console.error('Create version error:', error)
        return { error: 'Failed to create version' }
    }
}
