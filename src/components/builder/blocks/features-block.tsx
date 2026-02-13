import { FeaturesBlock } from "@/types/builder"
import { CheckCircle2, Zap, Star, Shield, Search } from "lucide-react"

const iconMap: Record<string, any> = {
  check: CheckCircle2,
  zap: Zap,
  star: Star,
  shield: Shield,
  search: Search,
}

export function FeaturesBlockComponent({ block }: { block: FeaturesBlock }) {
  const { heading, features } = block.content

  return (
    <section className="py-16 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = (feature.icon && iconMap[feature.icon]) || CheckCircle2
            
            return (
              <div key={i} className="flex gap-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <Icon className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
