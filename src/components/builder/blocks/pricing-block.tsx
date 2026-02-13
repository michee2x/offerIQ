import { PricingBlock } from "@/types/builder"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export function PricingBlockComponent({ block }: { block: PricingBlock }) {
  const { heading, plans } = block.content

  return (
    <section className="py-20 px-4 md:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">{heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <Card key={i} className={`relative flex flex-col h-full ${plan.highlight ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
              {plan.highlight && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-1 font-bold">
                    <span className="text-4xl">{plan.price}</span>
                    <span className="text-muted-foreground font-normal text-sm">/{plan.frequency}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild variant={plan.highlight ? "default" : "outline"}>
                  <Link href={plan.ctaLink}>{plan.ctaText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
