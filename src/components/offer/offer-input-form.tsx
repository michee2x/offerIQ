"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OfferAnalysis } from "@/types/offer"

interface OfferInputFormProps {
  onAnalysisComplete: (analysis: OfferAnalysis) => void
}

export function OfferInputForm({ onAnalysisComplete }: OfferInputFormProps) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [type, setType] = useState<"text" | "url">("text")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/analyze-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      })

      const data = await res.json()
      
      if (data.analysis) {
        onAnalysisComplete(data.analysis)
      }
    } catch (error) {
      console.error("Failed to analyze", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analyze Your Offer</CardTitle>
        <CardDescription>
          Paste your offer copy, sales letter, or website URL to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={type === "text" ? "default" : "outline"}
              onClick={() => setType("text")}
            >
              Raw Text
            </Button>
            <Button
              type="button"
              variant={type === "url" ? "default" : "outline"}
              onClick={() => setType("url")}
            >
              Website URL
            </Button>
          </div>

          {type === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="offer-content">Offer Copy / Description</Label>
              <Textarea
                id="offer-content"
                placeholder="Paste your offer text here..."
                className="min-h-[200px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="offer-url">Website URL</Label>
              <Input
                id="offer-url"
                placeholder="https://example.com/offer"
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Intelligence...
              </>
            ) : (
              "Generate Intelligence Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
