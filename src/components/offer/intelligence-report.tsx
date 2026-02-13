"use client"

import { OfferAnalysis } from "@/types/offer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, DollarSign, Target, Lightbulb, ArrowRight, Layout } from "lucide-react"

interface IntelligenceReportProps {
  analysis: OfferAnalysis
}

export function IntelligenceReport({ analysis }: IntelligenceReportProps) {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Score Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Offer Intelligence Score</CardTitle>
            <CardDescription>Based on monetization & conversion potential</CardDescription>
          </div>
          <div className="text-4xl font-bold text-primary">{analysis.score}/100</div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positioning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Positioning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium text-sm text-muted-foreground">Target Audience</div>
              <p>{analysis.positioning.target_audience}</p>
            </div>
            <div>
              <div className="font-medium text-sm text-muted-foreground">Primary Pain Point</div>
              <p>{analysis.positioning.primary_pain_point}</p>
            </div>
            <div>
              <div className="font-medium text-sm text-muted-foreground">Market Awareness</div>
              <Badge variant="secondary">{analysis.positioning.market_sophistication}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Pricing Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium text-sm text-muted-foreground">Suggested Price</div>
              <p className="text-xl font-bold">{analysis.pricing_strategy.suggested_price_point}</p>
            </div>
            <div>
              <div className="font-medium text-sm text-muted-foreground">Reasoning</div>
              <p className="text-sm">{analysis.pricing_strategy.reasoning}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.pricing_strategy.psychological_hooks.map((hook, i) => (
                <Badge key={i} variant="outline" className="text-xs">{hook}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-purple-500" />
            Recommended Funnel Architecture
          </CardTitle>
          <CardDescription>
            Best flow: <span className="font-semibold text-foreground uppercase">{analysis.funnel_strategy.recommended_flow.replace(/_/g, " ")}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            {analysis.funnel_strategy.steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start p-3 rounded-lg border bg-muted/20">
                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold border border-primary/20">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    {step.name} 
                    <span className="text-xs font-normal text-muted-foreground">({step.purpose})</span>
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {step.key_elements.map((el, j) => (
                      <li key={j} className="text-sm flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> {el}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Copy Angles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Copy & Messaging Angles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Killer Headlines</h4>
            <ul className="space-y-2">
              {analysis.copy_angles.headlines.map((h, i) => (
                <li key={i} className="text-sm border-l-2 border-primary pl-3 italic">"{h}"</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Hooks</h4>
            <ul className="space-y-2">
              {analysis.copy_angles.hooks.map((h, i) => (
                <li key={i} className="text-sm border-l-2 border-secondary pl-3">"{h}"</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
