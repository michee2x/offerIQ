'use server'

import { createAdminClient } from "@/utils/supabase/admin"
import { getSession } from "@/auth"
import { analyzeOffer, generateFunnelCopy, generatePageLayout } from "@/lib/ai"
import { OfferAnalysis, OfferInput } from "@/types/offer"
import { FunnelPageType, PageBlock } from "@/types/builder"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- OFFER ACTIONS ---

export async function saveOffer(workspaceId: string, input: OfferInput, analysis: OfferAnalysis) {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  const userId = session.user.id || session.user.email || 'unknown'

  // For MVP, we use the first headline as the name or a fallback
  const offerName = analysis.copy_angles.headlines[0] || "New Offer"

  const { data, error } = await supabase
    .from('offers')
    .insert({
        workspace_id: workspaceId,
        user_id: userId,
        name: offerName,
        status: 'analyzed',
        input_type: input.type,
        input_value: input.text || input.url || input.file_content || '',
        analysis: analysis
    })
    .select()
    .single()

  if (error) {
      console.error("Error saving offer:", error)
      throw new Error("Failed to save offer")
  }

  return data
}

// --- FUNNEL ACTIONS ---

export async function createFunnelFromOffer(offerId: string) {
    const session = await getSession()
    if (!session?.user) throw new Error("Unauthorized")

    const supabase = createAdminClient()
    const userId = session.user.id || session.user.email || 'unknown'

    // 1. Fetch Offer
    const { data: offerData, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single()
    
    if (offerError || !offerData) throw new Error("Offer not found")

    const analysis = offerData.analysis as OfferAnalysis

    // 2. Create Funnel Entry
    const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .insert({
            workspace_id: offerData.workspace_id,
            offer_id: offerId,
            user_id: userId,
            name: `${offerData.name} Funnel`,
            status: 'draft'
        })
        .select()
        .single()
    
    if (funnelError) throw new Error("Failed to create funnel")

    // 3. Generate Pages (MVP: Lead, Sales, Thank You)
    // We run these in parallel to speed up
    const pagesToGenerate: FunnelPageType[] = ['lead', 'sales', 'thank_you']
    
    const pagePromises = pagesToGenerate.map(async (pageType, index) => {
        // A. Generate Copy
        const copy = await generateFunnelCopy(analysis, pageType)
        
        // B. Generate Layout
        const blocks = await generatePageLayout(analysis, pageType, copy)

        // C. Save Page
        return supabase.from('funnel_pages').insert({
            funnel_id: funnel.id,
            name: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page`,
            slug: pageType,
            type: pageType,
            order_index: index,
            blocks: blocks,
            copy_data: copy,
            seo: { title: analysis.copy_angles.headlines[0] || 'Funnel Page', description: analysis.summary }
        })
    })

    await Promise.all(pagePromises)

    revalidatePath('/dashboard')
    return { funnelId: funnel.id }
}

export async function getFunnel(funnelId: string) {
    const supabase = createAdminClient()
    
    const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .select(`
            *,
            pages:funnel_pages(*)
        `)
        .eq('id', funnelId)
        .single()

    if (funnelError) return null

    // Sort pages by order_index
    funnel.pages.sort((a: any, b: any) => a.order_index - b.order_index)
    
    return funnel
}
