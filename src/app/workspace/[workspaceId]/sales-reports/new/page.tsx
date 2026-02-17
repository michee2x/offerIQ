"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/sales-report/file-upload'
import { OfferContextForm } from '@/components/sales-report/offer-context-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSalesReport, generateReportContent } from '@/app/actions/sales-report'
import { ArrowRight, Upload, FileText, Sparkles } from 'lucide-react'

interface NewSalesReportPageProps {
  params: Promise<{ workspaceId: string }>
}

export default function NewSalesReportPage({ params }: NewSalesReportPageProps) {
  const router = useRouter()
  const [step, setStep] = useState<'title' | 'upload' | 'context' | 'generating'>('title')
  const [reportTitle, setReportTitle] = useState('')
  const [offerId, setOfferId] = useState('')
  const [reportId, setReportId] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')

  // Unwrap params
  useState(() => {
    params.then(p => setWorkspaceId(p.workspaceId))
  })

  const handleTitleSubmit = () => {
    if (!reportTitle.trim()) return
    
    // Generate a proper UUID for the offer ID
    const tempOfferId = crypto.randomUUID()
    setOfferId(tempOfferId)
    setStep('upload')
  }

  const handleSkipUpload = () => {
    setStep('context')
  }

  const handleContextComplete = async (contextId: string) => {
    // Create sales report
    const result = await createSalesReport({
      workspaceId,
      offerId: contextId,
      title: reportTitle
    })

    if (result.error || !result.report) {
      console.error(result.error)
      return
    }

    setReportId(result.report.id)
    setStep('generating')

    // Start generating report
    const genResult = await generateReportContent(result.report.id)

    if (genResult.error) {
      console.error(genResult.error)
      return
    }

    // Redirect to report page
    router.push(`/workspace/${workspaceId}/sales-reports/${result.report.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Sales Report</h2>
        <p className="text-muted-foreground">
          Get AI-powered strategic insights for your offer
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Title', 'Upload', 'Context', 'Generate'].map((label, index) => {
          const stepIndex = ['title', 'upload', 'context', 'generating'].indexOf(step)
          const isActive = index === stepIndex
          const isComplete = index < stepIndex

          return (
            <div key={label} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isComplete
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/25 text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {index < 3 && (
                <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Title */}
      {step === 'title' && (
        <Card>
          <CardHeader>
            <CardTitle>Report Title</CardTitle>
            <CardDescription>
              Give your sales report a descriptive title
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Fitness Program Sales Strategy"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>
            <Button onClick={handleTitleSubmit} disabled={!reportTitle.trim()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: File Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Files (Optional)
            </CardTitle>
            <CardDescription>
              Upload your offer files for deeper analysis. We'll extract key information automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              workspaceId={workspaceId}
              offerId={offerId}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkipUpload} className="flex-1">
                Skip for Now
              </Button>
              <Button onClick={() => setStep('context')} className="flex-1">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Offer Context */}
      {step === 'context' && (
        <div>
          <OfferContextForm
            workspaceId={workspaceId}
            onComplete={handleContextComplete}
          />
        </div>
      )}

      {/* Step 4: Generating */}
      {step === 'generating' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Generating Your Sales Report</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Our AI is analyzing your offer and creating a comprehensive strategic report. This usually takes 2-5 minutes...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
