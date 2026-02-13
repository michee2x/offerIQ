export type BlockType = 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'faq' | 'header' | 'footer';
export type FunnelPageType = 'lead' | 'sales' | 'upsell' | 'thank_you';

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  style?: Record<string, any>;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  content: {
    heading: string;
    subheading: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
  };
}

export interface FeaturesBlock extends BaseBlock {
  type: 'features';
  content: {
    heading: string;
    features: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

export interface PricingBlock extends BaseBlock {
  type: 'pricing';
  content: {
    heading: string;
    plans: Array<{
      name: string;
      price: string;
      frequency: string;
      features: string[];
      highlight?: boolean;
      ctaText: string;
      ctaLink: string;
    }>;
  };
}

export interface TestimonialsBlock extends BaseBlock {
  type: 'testimonials';
  content: {
    heading: string;
    testimonials: Array<{
      name: string;
      role?: string;
      quote: string;
      avatar?: string;
    }>;
  };
}

export interface FaqBlock extends BaseBlock {
  type: 'faq';
  content: {
    heading: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export interface CtaBlock extends BaseBlock {
  type: 'cta';
  content: {
    heading: string;
    subheading?: string;
    ctaText: string;
    ctaLink: string;
  };
}

// Union type for all blocks
export type PageBlock = HeroBlock | FeaturesBlock | PricingBlock | TestimonialsBlock | FaqBlock | CtaBlock | BaseBlock;

export interface FunnelPage {
  id: string;
  name: string;
  slug: string;
  blocks: PageBlock[];
  seo: {
    title: string;
    description: string;
  };
}

export interface Funnel {
  id: string;
  name: string;
  offer_id: string;
  domain?: string;
  subdomain?: string;
  pages: FunnelPage[];
  theme: {
    primaryColor: string;
    fontFamily: string;
  };
}
