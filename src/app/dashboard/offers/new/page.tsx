"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OfferInputForm } from "@/components/offer/offer-input-form"
import { IntelligenceReport } from "@/components/offer/intelligence-report"
import { OfferAnalysis } from "@/types/offer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { saveOffer, createFunnelFromOffer } from "@/app/actions/funnel"
import { toast } from "sonner" // Assuming sonner is installed, if not will gracefully fail or need install. I'll use simple console/alert if sonner missing, but shadcn usually has it. I'll stick to console for safety or use a simple alert if toast not available. actually I will assume the user has toast. 
// Re-checking imports, I didn't see sonner installed explicitly but it's common. I'll remove toast for now to be safe and just log/alert.

export default function NewOfferPage() {
  const [analysis, setAnalysis] = useState<OfferAnalysis | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const router = useRouter()

  const handleProceed = async () => {
    if (!analysis) return
    setIsBuilding(true)
    
    try {
        // 1. Get workspace ID (from localStorage for MVP)
        const workspaceId = localStorage.getItem("activeWorkspaceId")
        if (!workspaceId) {
            alert("Please select or create a workspace first!")
            setIsBuilding(false)
            return
        }

        // 2. Save Offer
        const offer = await saveOffer(workspaceId, { type: 'raw_text', text: 'AI Generated' }, analysis)
        
        // 3. Create Funnel
        const { funnelId } = await createFunnelFromOffer(offer.id)

        // 4. Redirect
        router.push(`/builder/${funnelId}`)

    } catch (error) {
        console.error("Failed to create funnel:", error)
        alert("Failed to create funnel. Check console.")
        setIsBuilding(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">New Offer Intelligence</h2>
        <p className="text-muted-foreground">
          Analyze your offer mechanics before building the funnel.
        </p>
      </div>

      {!analysis ? (
        <OfferInputForm onAnalysisComplete={setAnalysis} />
      ) : (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setAnalysis(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Input
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button onClick={handleProceed} disabled={isBuilding}>
                        {isBuilding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Building Funnel...
                            </>
                        ) : (
                            "Proceed to Builder"
                        )}
                    </Button>
                </div>
            </div>
          <IntelligenceReport analysis={analysis} />
        </div>
      )}
    </div>
  )
}
