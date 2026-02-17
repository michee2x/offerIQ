import { GoogleGenAI } from "@google/genai";
import { OfferAnalysis } from "@/types/offer";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

import { FunnelPageType, PageBlock } from "@/types/builder";


const SYSTEM_PROMPT = `
You are the world's best direct response copywriter and offer strategist (think Alex Hormozi meets Ogilvy). 
Your goal is to analyze raw offer inputs and generate a structured "Offer Intelligence Report".

You must output valid JSON matching the following schema:
{
  "score": number (0-100),
  "summary": string,
  "positioning": {
    "target_audience": string,
    "primary_pain_point": string,
    "core_benefit": string,
    "market_sophistication": string (one of: "unaware", "problem_aware", "solution_aware", "product_aware", "most_aware"),
    "messaging_angles": string[]
  },
  "revenue_model": {
    "type": string,
    "monetization_strategy": string,
    "conversion_strategy": string
  },
  "pricing_strategy": {
    "suggested_price_point": string,
    "reasoning": string,
    "psychological_hooks": string[],
    "price_gap_analysis": string
  },
  "upsell_structure": {
    "recommended_upsells": [
      { "offer_name": string, "price_point": string, "reasoning": string }
    ]
  },
  "bonus_suggestions": [
     { "name": string, "value_proposition": string }
  ],
  "funnel_strategy": {
    "recommended_flow": string (one of: "lead_magnet_sales", "direct_sales", "webinar", "application"),
    "steps": [
      { "name": string, "purpose": string, "key_elements": string[] }
    ]
  },
  "copy_angles": {
    "headlines": string[],
    "hooks": string[],
    "email_subjects": string[]
  },
  "funnel_health_score": {
    "clarity": number,
    "monetization_depth": number,
    "pricing": number,
    "overall": number
  },
  "recommendations": string[]
}

Analyze deeply. Be critical. Focus on conversion and monetization.
Return ONLY the JSON object, no markdown formatting.
`;


export async function analyzeOffer(content: string): Promise<OfferAnalysis> {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("⚠️ GOOGLE_API_KEY is missing. Returning mock data.");
    return MOCK_ANALYSIS;
  }

  try {
    console.log("🤖 Sending request to Gemini...");

    const modelName = process.env.GEMINI_MODEL!;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `${SYSTEM_PROMPT}\n\nAnalyze this offer and return ONLY valid JSON:\n\n${content}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    console.log("✅ Gemini response received");

    // Safety check for undefined text
    if (!response.text) {
      throw new Error("No text in response");
    }

    console.log("--- Google Gemini Response ---");
    console.log(response.text);
    console.log("------------------------------");

    // Parse the JSON response
    const cleaned = response.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleaned) as OfferAnalysis;

  } catch (error: any) {
    console.error("❌ AI Analysis failed:", error);
    console.error("Error details:", error.message);
    console.warn("⚠️ Returning mock data due to error.");
    return MOCK_ANALYSIS;
  }
}

export async function generateFunnelCopy(offer: OfferAnalysis, pageType: FunnelPageType): Promise<any> {
  if (!process.env.GOOGLE_API_KEY) throw new Error("API Key missing");

  const prompt = `
    You are an expert funnel copywriter.
    Based on the following Offer Intelligence, generate high-converting copy for a "${pageType}" page.
    
    Offer Context:
    Target Audience: ${offer.positioning.target_audience}
    Pain Point: ${offer.positioning.primary_pain_point}
    Benefit: ${offer.positioning.core_benefit}
    Headlines: ${offer.copy_angles.headlines.join(", ")}
    
    Output structured JSON for the page content, including:
    - headlines
    - subheadlines
    - body_copy
    - bullet_points
    - cta_text
    - testimonial_placeholders (if applicable)
    
    Return ONLY JSON.
    `;

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-001";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  if (!response.text) return {};

  try {
    const cleaned = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

export async function generatePageLayout(offer: OfferAnalysis, pageType: FunnelPageType, copyData: any): Promise<PageBlock[]> {
  if (!process.env.GOOGLE_API_KEY) throw new Error("API Key missing");

  const prompt = `
     You are a conversion optimization expert and UI designer.
     Map the provided copy to a high-converting page layout using the following block types:
     'hero', 'features', 'pricing', 'testimonials', 'faq', 'cta'.
     
     Page Type: ${pageType}
     Copy Data: ${JSON.stringify(copyData)}
     
     Return a JSON array of PageBlock objects. Each block must have:
     - id: string (unique)
     - type: string (one of the above)
     - content: object matching the specific block schema.
     
     Hero Schema: { heading, subheading, ctaText, ctaLink }
     Features Schema: { heading, features: [{ title, description, icon }] }
     Pricing Schema: { heading, plans: [{ name, price, features, ctaText }] }
     Testimonials Schema: { heading, testimonials: [{ name, quote, role }] }
     Video Schema: { videoUrl, caption } (optional)
     CTA Schema: { heading, subheading, ctaText }
     
     Return ONLY the JSON array.
     `;

  const modelName = process.env.GEMINI_MODEL!

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  if (!response.text) return [];

  try {
    const cleaned = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as PageBlock[];
  } catch {
    return [];
  }
}

const MOCK_ANALYSIS: OfferAnalysis = {
  score: 85,
  summary: "A strong coaching offer that needs better risk reversal.",
  positioning: {
    target_audience: "Mid-level corporate managers burning out",
    primary_pain_point: "Lack of career fulfillment and exhaustion",
    core_benefit: "Reclaim 10 hours/week and double income",
    market_sophistication: "problem_aware",
    messaging_angles: ["Escape the rat race", "Become your own boss"],
  },
  revenue_model: {
    type: "High Ticket Coaching",
    monetization_strategy: "Upfront application fee + Backend program",
    conversion_strategy: "Phone close",
  },
  pricing_strategy: {
    suggested_price_point: "$2,000 - $3,000",
    reasoning: "High-touch coaching requires premium anchor.",
    psychological_hooks: ["Investment in future self", "Cost of inaction"],
    price_gap_analysis: "Competitors charge $5k+",
  },
  upsell_structure: {
    recommended_upsells: [
      { offer_name: "VIP Retreat", price_point: "$5,000", reasoning: "In-person immersion" }
    ]
  },
  bonus_suggestions: [
    { name: "SOP Toolkit", value_proposition: "Save 20 hours of setup time" }
  ],
  funnel_strategy: {
    recommended_flow: "application",
    steps: [
      {
        name: "VSL Landing Page",
        purpose: "Pre-frame the value and filter leads",
        key_elements: ["Headline", "Social Proof", "Application CTA"],
      },
      {
        name: "Application Form",
        purpose: "Qualify leads",
        key_elements: ["Income qualify", "Commitment check"],
      },
    ],
  },
  copy_angles: {
    headlines: ["Stop Trading Time for Money", "The Executive Exit Strategy"],
    hooks: ["Your boss hopes you never read this.", "Burnout is a choice."],
    email_subjects: ["Are you tired yet?", "Invitation inside"],
  },
  funnel_health_score: {
    clarity: 8,
    monetization_depth: 7,
    pricing: 9,
    overall: 8
  },
  recommendations: [
    "Add a stronger guarantee.",
    "Show more client case studies.",
  ],
};