"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Monitor, Save, Smartphone, Tablet } from "lucide-react"
import Link from "next/link"

import { BlockRenderer } from "@/components/builder/block-renderer"
import { PageBlock } from "@/types/builder"

// Mock Data
const INITIAL_BLOCKS: PageBlock[] = [
  {
    id: "1",
    type: "hero",
    content: {
      heading: "Transform Your Offer into a Revenue Machine",
      subheading: "The AI-powered operating system that analyzes, optimizes, and scales your monetization strategy.",
      ctaText: "Start Building Now",
      ctaLink: "#",
    },
  },
  {
    id: "2",
    type: "features",
    content: {
      heading: "Everything You Need to Scale",
      features: [
        {
          title: "Offer Intelligence",
          description: "Deep AI analysis of your offer structure, pricing, and positioning.",
          icon: "search",
        },
        {
          title: "Instant Funnels",
          description: "Generate complete sales funnels including copy and design in seconds.",
          icon: "zap",
        },
        {
          title: "Revenue Analytics",
          description: "Track every dollar with precision attribution and conversion metrics.",
          icon: "chart",
        },
      ],
    },
  },
  {
    id: "3",
    type: "pricing",
    content: {
      heading: "Simple, Transparent Pricing",
      plans: [
        {
          name: "Starter",
          price: "$49",
          frequency: "mo",
          features: ["1 Workspace", "3 Funnels", "Basic Analytics"],
          ctaText: "Get Started",
          ctaLink: "#",
        },
        {
          name: "Pro",
          price: "$149",
          frequency: "mo",
          features: ["3 Workspaces", "Unlimited Funnels", "Advanced Intelligence", "Priority Support"],
          highlight: true,
          ctaText: "Go Pro",
          ctaLink: "#",
        },
        {
          name: "Agency",
          price: "$399",
          frequency: "mo",
          features: ["Unlimited Workspaces", "White Labeling", "API Access"],
          ctaText: "Contact Sales",
          ctaLink: "#",
        },
      ],
    },
  },
]

export default function BuilderPage() {
  const [blocks, setBlocks] = React.useState<PageBlock[]>(INITIAL_BLOCKS)
  const [activeTab, setActiveTab] = React.useState("blocks")

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold">Funnel: High Ticket Coaching Application</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden md:flex bg-muted rounded-md p-1 mr-4">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Monitor className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Tablet className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Smartphone className="h-4 w-4" /></Button>
           </div>
          <Button variant="outline" size="sm">Preview</Button>
          <Button size="sm"><Save className="mr-2 h-4 w-4" /> Publish</Button>
        </div>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        
        {/* Left Sidebar: Controls */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-background border-r">
          <Tabs defaultValue="blocks" className="h-full flex flex-col">
            <div className="p-4 pb-0">
                <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
            </div>
            <Separator className="my-4" />
            <ScrollArea className="flex-1">
                <TabsContent value="blocks" className="p-4 m-0 space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Structure</h3>
                        <Button variant="secondary" className="w-full justify-start cursor-grab">Hero Section</Button>
                        <Button variant="secondary" className="w-full justify-start cursor-grab">Feature Grid</Button>
                        <Button variant="secondary" className="w-full justify-start cursor-grab">Pricing Table</Button>
                        <Button variant="secondary" className="w-full justify-start cursor-grab">Testimonials</Button>
                        <Button variant="secondary" className="w-full justify-start cursor-grab">FAQ Accordion</Button>
                        <Button variant="secondary" className="w-full justify-start cursor-grab">Call to Action</Button>
                    </div>
                </TabsContent>
                <TabsContent value="style" className="p-4 m-0">
                    <p className="text-sm text-muted-foreground">Global styles configuration (Colors, Fonts) will go here.</p>
                </TabsContent>
            </ScrollArea>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center: Canvas */}
        <ResizablePanel defaultSize={80}>
          <ScrollArea className="h-full bg-muted/20">
            <div className="max-w-full mx-auto min-h-screen bg-background shadow-sm">
                {blocks.map((block) => (
                    <div key={block.id} className="group relative hover:ring-2 hover:ring-primary/50 transition-all">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-2">
                             <Button size="sm" variant="secondary">Edit</Button>
                             <Button size="sm" variant="destructive">Delete</Button>
                        </div>
                        <BlockRenderer block={block} />
                    </div>
                ))}
            </div>
          </ScrollArea>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  )
}
