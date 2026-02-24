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

  let fullReport = `<div class="sales-report">\n`
  fullReport += `<h1>Sales Report: ${offerContext.product_name}</h1>\n`
  fullReport += `<p><em>Generated on ${new Date().toLocaleDateString()}</em></p>\n`
  fullReport += `<hr />\n\n`

  // Generate ALL sections sequentially with delay to respect 5 RPM Free Tier limit
  const sections = Object.keys(SECTION_METADATA) as ReportSection[]

  console.log(`🚀 Generating ${sections.length} sections sequentially using Gemini...`)

  const sectionContents: string[] = []

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`Generating ${i + 1}/${sections.length}: ${section}...`)

    const content = await generateReportSection(
      section,
      SECTION_METADATA[section],
      contextPrompt,
      modelName
    )
    
    sectionContents.push(content)

    // Wait 15 seconds between requests to maintain 4 RPM (under the 5 RPM limit)
    if (i < sections.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 15000))
    }
  }

  // Build the full report
  sections.forEach((section, index) => {
    const sectionData = SECTION_METADATA[section]
    fullReport += `<h2>${sectionData.icon} ${sectionData.title}</h2>\n`
    fullReport += `${sectionContents[index]}\n`
    fullReport += `<hr />\n`
  })
  fullReport += `</div>`

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
  modelName: string,
  retries = 3
): Promise<string> {
  try {
    const systemPrompt = `You are a world-class Revenue Consultant and Marketing Strategist. You provide deep, actionable insights that transform offers into high-converting revenue engines. Be specific, strategic, and data-informed. Provide your response in clear, fluent, professional English using straightforward language that is easy to comprehend without unnecessary jargon. NEVER use any emojis in your response. Format your output strictly as well-structured HTML, optimizing for readability with excellent use of typography, spacing, and appropriate HTML paragraphing.`

    const userPrompt = `${contextPrompt}\n\nSection Core Directive: ${sectionData.title}\nGoal: ${sectionData.description}\n\nTask: ${sectionData.prompt}\n\nCRITICAL AI INSTRUCTION:\nThe Output isn't just content; it is Clarity. Do NOT write long essays. Do NOT generate unnecessary fluffy filler. Keep answers extraordinarily concise, punchy, and highly structured format (using <ul>/<li> for lists).\n\nProvide a highly concise analysis in semantically structured HTML format. Use appropriate HTML tags such as <h4>, <p>, <ul>, <li>, and <strong>. Do NOT wrap the response in markdown code blocks (e.g., \`\`\`html) or add any extra text. Return raw HTML only.`
    console.log("this is the reports prompt: ", `${systemPrompt}\n\n${userPrompt}`)

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
  } catch (error: any) {
    const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');
    const isUnavailable = error.status === 503 || error.message?.includes('503');
    
    if (retries > 0 && (isRateLimit || isUnavailable)) {
      const waitTime = isRateLimit ? 35000 : 15000;
      console.log(`⏳ API error (${error.status || 'Rate Limit/Quota'}) for ${section}. Retrying in ${waitTime/1000}s... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return generateReportSection(section, sectionData, contextPrompt, modelName, retries - 1);
    }
    console.error(`Error generating section ${section}:`, error)
    return `<p><em>Error generating this section. Please try regenerating.</em></p>`
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

  const systemPrompt = `You are a world-class Revenue Consultant and Marketing Strategist. Provide your response in clear, fluent, professional English using straightforward language that is easy to comprehend without unnecessary jargon. NEVER use any emojis in your response. Format your output strictly as well-structured HTML, optimizing for readability with excellent use of typography, spacing, and appropriate HTML paragraphing.`
  const userPrompt = `${contextPrompt}\n\nSection Core Directive: ${sectionData.title}\nGoal: ${sectionData.description}\n\nTask: ${sectionData.prompt}\n\nAdditional Instructions: ${additionalInstructions}\n\nCRITICAL AI INSTRUCTION:\nThe Output isn't just content; it is Clarity. Do NOT write long essays. Keep answers extraordinarily concise, punchy, and highly structured (using <ul>/<li> for lists).\n\nProvide a highly concise analysis in semantically structured HTML format. Use appropriate HTML tags such as <h4>, <p>, <ul>, <li>, and <strong>. Do NOT wrap the response in markdown code blocks (e.g., \`\`\`html) or add any extra text. Return raw HTML only.`

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

  const systemPrompt = 'You are a helpful AI assistant that refines sales report sections based on user feedback. Provide your response in clear, fluent, professional English using straightforward language that is easy to comprehend without unnecessary jargon. NEVER use any emojis in your response. Format your output strictly as well-structured HTML.'
  const userPrompt = `Current section HTML content:\n\n${currentContent}\n\nUser request: ${userMessage}\n\nProvide the refined version of this section. Ensure it is formatted in semantic HTML. Do NOT wrap the response in markdown code blocks. Return raw HTML only.`

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
