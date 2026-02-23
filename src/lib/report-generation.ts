import { GoogleGenAI } from "@google/genai"
import { SECTION_METADATA, type ReportSection } from '@/types/sales-report'
import type { OfferContext } from '@/types/sales-report'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
})

/**
 * Generate sales report using Gemini AI (OPTIMIZED - Parallel generation)
 */
export async function generateSalesReport(
  offerContext: OfferContext,
  fileSummaries: string[]
): Promise<string> {
  const contextPrompt = buildContextPrompt(offerContext, fileSummaries)
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"

  let fullReport = `# Sales Report: ${offerContext.product_name}\n\n`
  fullReport += `*Generated on ${new Date().toLocaleDateString()}*\n\n`
  fullReport += `---\n\n`

  // Generate ALL sections in PARALLEL for speed
  const sections = Object.keys(SECTION_METADATA) as ReportSection[]

  console.log(`🚀 Generating ${sections.length} sections in parallel using Gemini...`)

  const sectionPromises = sections.map(section =>
    generateReportSection(
      section,
      SECTION_METADATA[section],
      contextPrompt,
      modelName
    )
  )

  // Wait for all sections to complete
  const sectionContents = await Promise.all(sectionPromises)

  // Build the full report
  sections.forEach((section, index) => {
    const sectionData = SECTION_METADATA[section]
    fullReport += `## ${sectionData.icon} ${sectionData.title}\n\n`
    fullReport += `${sectionContents[index]}\n\n`
    fullReport += `---\n\n`
  })

  console.log(`✅ Report generation complete!`)
  return fullReport
}

/**
 * Generate a single report section using Gemini
 */
async function generateReportSection(
  section: ReportSection,
  sectionData: any,
  contextPrompt: string,
  modelName: string
): Promise<string> {
  try {
    const systemPrompt = `You are a world-class Revenue Consultant and Marketing Strategist. You provide deep, actionable insights that transform offers into high-converting revenue engines. Be specific, strategic, and data-informed. Provide your response in clear, fluent, professional English using straightforward language that is easy to comprehend without unnecessary jargon. NEVER use any emojis in your response.`

    const userPrompt = `${contextPrompt}\n\n${sectionData.prompt}\n\nProvide a comprehensive analysis in markdown format. Use bullet points, subheadings, and clear structure. Be specific and actionable.`

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    })

    if (!response.text) {
      throw new Error('No text in response')
    }

    return response.text
  } catch (error) {
    console.error(`Error generating section ${section}:`, error)
    return `*Error generating this section. Please try regenerating.*`
  }
}

/**
 * Regenerate a specific section
 */
export async function regenerateReportSection(
  section: ReportSection,
  offerContext: OfferContext,
  fileSummaries: string[],
  additionalInstructions: string
): Promise<string> {
  const contextPrompt = buildContextPrompt(offerContext, fileSummaries)
  const sectionData = SECTION_METADATA[section]
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"

  const systemPrompt = `You are a world-class Revenue Consultant and Marketing Strategist. Provide your response in clear, fluent, professional English using straightforward language that is easy to comprehend without unnecessary jargon. NEVER use any emojis in your response.`
  const userPrompt = `${contextPrompt}\n\n${sectionData.prompt}\n\nAdditional Instructions: ${additionalInstructions}\n\nProvide a comprehensive analysis in markdown format.`

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  })

  if (!response.text) {
    throw new Error('No text in response')
  }

  return response.text
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
  userMessage: string
): Promise<string> {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"

  const systemPrompt = 'You are a helpful AI assistant that refines sales report sections based on user feedback. Maintain the markdown format and structure. Provide your response in clear, fluent, professional English using straightforward language that is easy to comprehend without unnecessary jargon. NEVER use any emojis in your response.'
  const userPrompt = `Current section content:\n\n${currentContent}\n\nUser request: ${userMessage}\n\nProvide the refined version of this section.`

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  })

  if (!response.text) {
    throw new Error('No text in response')
  }

  return response.text
}

/**
 * Generate content summary using Gemini
 */
export async function generateContentSummary(content: string): Promise<string> {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"

  // Chunk content if too long (max 30000 chars for Gemini)
  const chunks = chunkText(content, 30000)

  const summaries = await Promise.all(
    chunks.map(chunk => summarizeChunk(chunk, modelName))
  )

  // If multiple chunks, combine and summarize again
  if (summaries.length > 1) {
    const combined = summaries.join('\n\n')
    return await summarizeChunk(combined, modelName)
  }

  return summaries[0]
}

/**
 * Summarize a single chunk of text
 */
async function summarizeChunk(text: string, modelName: string): Promise<string> {
  const systemPrompt = 'Extract key topics, main points, structure, and important details from the content. Be comprehensive but concise.'

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `${systemPrompt}\n\n${text}`,
    config: {
      temperature: 0.3,
      maxOutputTokens: 1000,
    },
  })

  if (!response.text) {
    throw new Error('No summary generated')
  }

  return response.text
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
