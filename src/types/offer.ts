export interface OfferAnalysis {
  score: number;
  summary: string;
  positioning: {
    target_audience: string;
    primary_pain_point: string;
    core_benefit: string;
    market_sophistication: 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';
    messaging_angles: string[];
  };
  revenue_model: {
    type: string;
    monetization_strategy: string;
    conversion_strategy: string;
  };
  pricing_strategy: {
    suggested_price_point: string;
    reasoning: string;
    psychological_hooks: string[];
    price_gap_analysis?: string;
  };
  upsell_structure: {
    recommended_upsells: Array<{
      offer_name: string;
      price_point: string;
      reasoning: string;
    }>;
  };
  bonus_suggestions: Array<{
    name: string;
    value_proposition: string;
  }>;
  funnel_strategy: {
    recommended_flow: 'lead_magnet_sales' | 'direct_sales' | 'webinar' | 'application';
    steps: {
      name: string;
      purpose: string;
      key_elements: string[];
    }[];
  };
  copy_angles: {
    headlines: string[];
    hooks: string[];
    email_subjects: string[];
  };
  funnel_health_score: {
    clarity: number;
    monetization_depth: number;
    pricing: number;
    overall: number;
  };
  recommendations: string[];
}

export interface OfferInput {
  text?: string;
  url?: string;
  file_content?: string;
  type: 'raw_text' | 'url' | 'document';
}
