import { PageBlock } from "@/types/builder"
import { HeroBlockComponent } from "./blocks/hero-block"
import { FeaturesBlockComponent } from "./blocks/features-block"
import { PricingBlockComponent } from "./blocks/pricing-block"

export function BlockRenderer({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "hero":
      return <HeroBlockComponent block={block} />
    case "features":
      return <FeaturesBlockComponent block={block} />
    case "pricing":
      return <PricingBlockComponent block={block} />
    // Placeholder for other types
    default:
      return (
        <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Unknown block type: {block.type}</p>
        </div>
      )
  }
}
