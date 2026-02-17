"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { BarChart3, Home, FileText, Workflow, FilePenLine, Settings, Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher"

interface WorkspaceSidebarProps {
  workspaces: any[]
  currentWorkspace: any
}

const workspaceSidebarItems = [
  { name: "Overview", href: "", icon: Home },
  { name: "Sales Pages", href: "/sales-pages", icon: FileText },
  { name: "Funnels", href: "/funnels", icon: Workflow },
  { name: "Drafts", href: "/drafts", icon: FilePenLine },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function WorkspaceSidebar({ workspaces, currentWorkspace }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const workspaceId = params?.workspaceId as string

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
            {workspaceSidebarItems.map((item) => {
              const href = `/workspace/${workspaceId}${item.href}`
              const isActive = pathname === href
              
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
                  <Link href={href}>
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
