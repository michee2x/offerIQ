"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveOfferContext } from '@/app/actions/offer-context'
import { Loader2 } from 'lucide-react'

const offerContextSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  target_audience: z.string().min(1, 'Target audience is required'),
  main_problem: z.string().min(1, 'Main problem is required'),
  key_features: z.string().min(1, 'At least one feature is required'),
  price_point: z.string().min(1, 'Price point is required'),
  geographic_focus: z.string().min(1, 'Geographic focus is required'),
  usp: z.string().min(1, 'USP is required'),
  additional_context: z.string().optional()
})

type OfferContextFormData = z.infer<typeof offerContextSchema>

interface OfferContextFormProps {
  workspaceId: string
  onComplete: (contextId: string) => void
}

export function OfferContextForm({ workspaceId, onComplete }: OfferContextFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OfferContextFormData>({
    resolver: zodResolver(offerContextSchema)
  })

  const onSubmit = async (data: OfferContextFormData) => {
    setLoading(true)

    try {
      // Parse key features from comma-separated string
      const keyFeatures = data.key_features
        .split(',')
        .map(f => f.trim())
        .filter(Boolean)

      const result = await saveOfferContext({
        workspace_id: workspaceId,
        ...data,
        key_features: keyFeatures
      })

      if (result.error) {
        console.error(result.error)
        return
      }

      if (result.context) {
        onComplete(result.context.id)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Tell us about your offer so we can create the perfect sales strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              placeholder="e.g., Ultimate Fitness Transformation Program"
              {...register('product_name')}
            />
            {errors.product_name && (
              <p className="text-sm text-destructive">{errors.product_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              placeholder="e.g., Online Course, Ebook, Software, Coaching"
              {...register('category')}
            />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience *</Label>
            <Textarea
              id="target_audience"
              placeholder="Who is this for? Be specific about demographics, experience level, etc."
              rows={3}
              {...register('target_audience')}
            />
            {errors.target_audience && (
              <p className="text-sm text-destructive">{errors.target_audience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_problem">Main Problem Solved *</Label>
            <Textarea
              id="main_problem"
              placeholder="What specific problem does your offer solve?"
              rows={3}
              {...register('main_problem')}
            />
            {errors.main_problem && (
              <p className="text-sm text-destructive">{errors.main_problem.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_features">Key Features *</Label>
            <Textarea
              id="key_features"
              placeholder="List 3-5 main features or modules (comma-separated)"
              rows={3}
              {...register('key_features')}
            />
            <p className="text-xs text-muted-foreground">
              Separate features with commas
            </p>
            {errors.key_features && (
              <p className="text-sm text-destructive">{errors.key_features.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_point">Price Point *</Label>
            <Input
              id="price_point"
              placeholder="e.g., $97, $997, $47/month"
              {...register('price_point')}
            />
            {errors.price_point && (
              <p className="text-sm text-destructive">{errors.price_point.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="geographic_focus">Geographic Focus *</Label>
            <Input
              id="geographic_focus"
              placeholder="e.g., Global, USA, Africa, Europe"
              {...register('geographic_focus')}
            />
            {errors.geographic_focus && (
              <p className="text-sm text-destructive">{errors.geographic_focus.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usp">Unique Selling Proposition *</Label>
            <Textarea
              id="usp"
              placeholder="What makes your offer different from competitors?"
              rows={3}
              {...register('usp')}
            />
            {errors.usp && (
              <p className="text-sm text-destructive">{errors.usp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_context">Additional Context (Optional)</Label>
            <Textarea
              id="additional_context"
              placeholder="Any other important information about your offer, market, or goals"
              rows={4}
              {...register('additional_context')}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Saving...' : 'Continue to Report Generation'}
      </Button>
    </form>
  )
}
