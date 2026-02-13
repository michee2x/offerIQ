import { HeroBlock } from "@/types/builder"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroBlockComponent({ block }: { block: HeroBlock }) {
  const { heading, subheading, ctaText, ctaLink, backgroundImage } = block.content
  
  return (
    <section className="relative py-20 px-4 md:px-6 lg:py-32 overflow-hidden bg-background">
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-foreground">
          {heading}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {subheading}
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
