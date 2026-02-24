// Database types for Sales Report feature

export type ReportStatus = 'draft' | 'generating' | 'complete' | 'archived'
export type ExtractionStatus = 'pending' | 'processing' | 'complete' | 'failed'

export interface SalesReport {
  id: string
  workspace_id: string
  offer_id: string
  title: string
  status: ReportStatus
  content: string // Markdown content
  metadata: {
    sections: {
      [key: string]: {
        status: 'complete' | 'pending'
        lastUpdated: string
      }
    }
    targetRegion?: string
    industry?: string
    priceRange?: string
  }
  version: number
  created_at: string
  updated_at: string
}

export interface OfferFile {
  id: string
  workspace_id: string
  offer_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  extraction_status: ExtractionStatus
  extracted_content?: string
  summary?: string
  metadata?: {
    duration?: number // for video/audio in seconds
    pages?: number // for PDFs
    transcriptSegments?: Array<{
      start: number
      end: number
      text: string
    }>
  }
  created_at: string
  updated_at: string
}

export interface OfferContext {
  id: string
  workspace_id: string
  product_name: string
  category: string
  target_audience: string
  main_problem: string
  key_features: string[]
  price_point: string
  geographic_focus: string
  usp: string
  additional_context?: string
  created_at: string
  updated_at: string
}

export interface FileAccessGrant {
  id: string
  email: string
  offer_id: string
  granted_at: string
  expires_at: string
  download_count: number
  max_downloads: number
  last_downloaded_at?: string
}

export interface ReportVersion {
  id: string
  report_id: string
  version: number
  content: string
  created_at: string
}

// Report section types
export const REPORT_SECTIONS = [
  'positioning',
  'revenue_model',
  'target_persona',
  'pain_points',
  'conversion_hooks',
  'funnel_structure',
  'pricing_strategy',
  'upsell_downsell',
  'strategic_bonuses',
  'messaging_angles',
  'funnel_health',
  'monetization_narrative',
  'use_cases',
  'value_perception'
] as const

export type ReportSection = typeof REPORT_SECTIONS[number]

export interface ReportSectionData {
  title: string
  icon: string
  description: string
  prompt: string
}

export const SECTION_METADATA: Record<ReportSection, ReportSectionData> = {
  positioning: {
    title: 'Offer Positioning Analysis',
    icon: '📊',
    description: 'How your offer should be positioned in the market to own a category instead of competing in one',
    prompt: 'Provide a concise, high-impact analysis of the market positioning for this offer. Give strategic recommendations for category ownership.'
  },
  revenue_model: {
    title: 'Revenue Model Architecture',
    icon: '💰',
    description: 'The exact pricing structure, payment options, and monetization model your offer requires',
    prompt: 'Provide a extremely concise, structured outline of the optimal revenue model including pricing structure and payment options.'
  },
  target_persona: {
    title: 'Target Persona Intelligence',
    icon: '🎯',
    description: 'Deep persona analysis: demographics, psychographics, buying behavior, decision triggers',
    prompt: 'Provide a structured, bulleted breakdown of the target persona including demographics, psychographics, and decision triggers. Make it concise.'
  },
  pain_points: {
    title: 'Pain Point Mapping',
    icon: '🔥',
    description: 'The real friction points your persona experiences (not surface-level complaints)',
    prompt: 'Map the deep pain points and friction your target persona experiences. Use bullet points and keep analysis brief and impactful.'
  },
  conversion_hooks: {
    title: 'Conversion Hook Library',
    icon: '🧲',
    description: 'Specific hooks engineered to eliminate buying resistance for THIS offer',
    prompt: 'Generate 3-5 specific conversion hooks engineered to eliminate buying resistance for this offer. Keep it highly concise.'
  },
  funnel_structure: {
    title: 'Funnel Structure Blueprint',
    icon: '📈',
    description: 'The exact funnel flow optimized for your offer\'s economics (not generic templates)',
    prompt: 'Design a highly concise, step-by-step funnel structure and flow optimized for this specific offer. Avoid fluff.'
  },
  pricing_strategy: {
    title: 'Pricing Strategy',
    icon: '💎',
    description: 'Recommended price points, payment plans, and anchoring tactics',
    prompt: 'Outline a brief, structured pricing strategy including price points and anchoring tactics. Be explicit and concise.'
  },
  upsell_downsell: {
    title: 'Upsell/Downsell Paths',
    icon: '🚀',
    description: 'Natural revenue expansion paths that increase LTV without friction',
    prompt: 'Provide a highly concise map of upsell and downsell paths to maximize lifetime value.'
  },
  strategic_bonuses: {
    title: 'Strategic Bonus Recommendations',
    icon: '🎁',
    description: 'Bonuses designed to increase perceived value and eliminate objections',
    prompt: 'Recommend 2-4 strategic bonuses that increase value and eliminate objections. Be concise.'
  },
  messaging_angles: {
    title: 'Messaging Angle Matrix',
    icon: '✍️',
    description: 'The exact angles to lead with based on persona psychology',
    prompt: 'Create a highly concise, bulleted messaging angle matrix based on target persona psychology.'
  },
  funnel_health: {
    title: 'Funnel Health Score',
    icon: '📉',
    description: 'Predicted conversion performance and revenue leakage points',
    prompt: 'Provide a concise assessment of predicted funnel health and identify 1-3 specific potential leakage points.'
  },
  monetization_narrative: {
    title: 'Monetization Strategy Narrative',
    icon: '🧠',
    description: 'Strategic reasoning behind every recommendation',
    prompt: 'Provide a concise, 1-2 paragraph strategic narrative detailing the reasoning behind your core recommendations.'
  },
  use_cases: {
    title: 'Real-World Use Case Scenarios',
    icon: '🏆',
    description: 'How operators in your vertical would deploy this exact offer',
    prompt: 'Briefly describe 2-3 specific real-world use case scenarios for deploying this offer. Keep descriptions short and punchy.'
  },
  value_perception: {
    title: 'Product Core Value Perception',
    icon: '💡',
    description: 'How your market perceives value—and how to reframe it for maximum willingness to pay',
    prompt: 'Analyze how the market perceives value and provide 1-2 concise reframing strategies to maximize willingness to pay.'
  }
}
