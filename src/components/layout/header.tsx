"use client"

import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        {/* Placeholder for Breadcrumbs or Search */}
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <ModeToggle />
      {/* Placeholder for UserNav */}
      <div className="h-8 w-8 rounded-full bg-primary/10" />
    </header>
  )
}
