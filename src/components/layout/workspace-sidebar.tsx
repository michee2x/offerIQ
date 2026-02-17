"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { BarChart3, Home, FileText, Workflow, FilePenLine, Settings, Bell, LayoutDashboard } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher"

interface WorkspaceSidebarProps {
  workspaces: any[]
  currentWorkspace: any
}

export function WorkspaceSidebar({ workspaces, currentWorkspace }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const workspaceId = params?.workspaceId as string

  const navItems = [
    { name: 'Overview', href: `/workspace/${workspaceId}`, icon: LayoutDashboard },
    { name: 'Sales Reports', href: `/workspace/${workspaceId}/sales-reports`, icon: FileText },
    { name: 'Sales Pages', href: `/workspace/${workspaceId}/sales-pages`, icon: FileText },
    { name: 'Funnels', href: `/workspace/${workspaceId}/funnels`, icon: Workflow },
    { name: 'Drafts', href: `/workspace/${workspaceId}/drafts`, icon: FilePenLine },
    { name: 'Notifications', href: `/workspace/${workspaceId}/notifications`, icon: Bell },
    { name: 'Settings', href: `/workspace/${workspaceId}/settings`, icon: Settings },
  ]

  return (
    <div className="hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px] h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-6 w-6" />
            <span className="">OfferIQ</span>
          </Link>
        </div>
        
        <div className="p-4">
          <WorkspaceSwitcher workspaces={workspaces} />
        </div>

        <div className="flex-1 py-0">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start gap-3 w-full",
                    isActive && "bg-secondary"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
