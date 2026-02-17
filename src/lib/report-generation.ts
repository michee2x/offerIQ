import { SECTION_METADATA, type ReportSection } from '@/types/sales-report'
import type { OfferContext } from '@/types/sales-report'

/**
 * Generate sales report using AI
 */
export async function generateSalesReport(
    offerContext: OfferContext,
    fileSummaries: string[],
    apiKey: string
): Promise<string> {
    const contextPrompt = buildContextPrompt(offerContext, fileSummaries)

    let fullReport = `# Sales Report: ${offerContext.product_name}\n\n`
    fullReport += `*Generated on ${new Date().toLocaleDateString()}*\n\n`
    fullReport += `---\n\n`

    // Generate each section
    for (const section of Object.keys(SECTION_METADATA) as ReportSection[]) {
        const sectionData = SECTION_METADATA[section]
        const sectionContent = await generateReportSection(
            section,
            sectionData,
            contextPrompt,
            apiKey
        )

        fullReport += `## ${sectionData.icon} ${sectionData.title}\n\n`
        fullReport += `${sectionContent}\n\n`
        fullReport += `---\n\n`
    }

    return fullReport
}

/**
 * Generate a single report section
 */
async function generateReportSection(
    section: ReportSection,
    sectionData: any,
    contextPrompt: string,
    apiKey: string
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a world-class Revenue Consultant and Marketing Strategist. You provide deep, actionable insights that transform offers into high-converting revenue engines. Be specific, strategic, and data-informed.`
                },
                {
                    role: 'user',
                    content: `${contextPrompt}\n\n${sectionData.prompt}\n\nProvide a comprehensive analysis in markdown format. Use bullet points, subheadings, and clear structure. Be specific and actionable.`
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    })

    if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
}

/**
 * Generate report with streaming
 */
export async function generateSalesReportStreaming(
    offerContext: OfferContext,
    fileSummaries: string[],
    apiKey: string,
    onProgress: (section: ReportSection, content: string) => void
): Promise<string> {
    const contextPrompt = buildContextPrompt(offerContext, fileSummaries)

    let fullReport = `# Sales Report: ${offerContext.product_name}\n\n`
    fullReport += `*Generated on ${new Date().toLocaleDateString()}*\n\n`
    fullReport += `---\n\n`

    const sections = Object.keys(SECTION_METADATA) as ReportSection[]

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        const sectionData = SECTION_METADATA[section]

        const sectionContent = await generateReportSection(
            section,
            sectionData,
            contextPrompt,
            apiKey
        )

        const sectionMarkdown = `## ${sectionData.icon} ${sectionData.title}\n\n${sectionContent}\n\n---\n\n`
        fullReport += sectionMarkdown

        // Call progress callback
        onProgress(section, fullReport)
    }

    return fullReport
}

/**
 * Regenerate a specific section
 */
export async function regenerateReportSection(
    section: ReportSection,
    offerContext: OfferContext,
    fileSummaries: string[],
    additionalInstructions: string,
    apiKey: string
): Promise<string> {
    const contextPrompt = buildContextPrompt(offerContext, fileSummaries)
    const sectionData = SECTION_METADATA[section]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a world-class Revenue Consultant and Marketing Strategist.`
                },
                {
                    role: 'user',
                    content: `${contextPrompt}\n\n${sectionData.prompt}\n\nAdditional Instructions: ${additionalInstructions}\n\nProvide a comprehensive analysis in markdown format.`
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    })

    if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
}

/**
 * Build context prompt from offer context and file summaries
 */
function buildContextPrompt(
    offerContext: OfferContext,
    fileSummaries: string[]
): string {
    let prompt = `## Offer Context\n\n`
    prompt += `**Product Name:** ${offerContext.product_name}\n`
    prompt += `**Category:** ${offerContext.category}\n`
    prompt += `**Target Audience:** ${offerContext.target_audience}\n`
    prompt += `**Main Problem Solved:** ${offerContext.main_problem}\n`
    prompt += `**Price Point:** ${offerContext.price_point}\n`
    prompt += `**Geographic Focus:** ${offerContext.geographic_focus}\n`
    prompt += `**Unique Selling Proposition:** ${offerContext.usp}\n\n`

    if (offerContext.key_features && offerContext.key_features.length > 0) {
        prompt += `**Key Features:**\n`
        offerContext.key_features.forEach(feature => {
            prompt += `- ${feature}\n`
        })
        prompt += `\n`
    }

    if (offerContext.additional_context) {
        prompt += `**Additional Context:** ${offerContext.additional_context}\n\n`
    }

    if (fileSummaries.length > 0) {
        prompt += `## Content Summaries\n\n`
        fileSummaries.forEach((summary, index) => {
            prompt += `### File ${index + 1}\n${summary}\n\n`
        })
    }

    return prompt
}

/**
 * Refine report section with AI assistant
 */
export async function refineReportSection(
    currentContent: string,
    userMessage: string,
    apiKey: string
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant that refines sales report sections based on user feedback. Maintain the markdown format and structure.'
                },
                {
                    role: 'user',
                    content: `Current section content:\n\n${currentContent}\n\nUser request: ${userMessage}\n\nProvide the refined version of this section.`
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    })

    if (!response.ok) {
        throw new Error(`AI refinement failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
}
