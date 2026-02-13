"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Package, Settings, FilePlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher"

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Offers", href: "/dashboard/offers", icon: Package },
  { name: "New Offer", href: "/dashboard/offers/new", icon: FilePlus },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardSidebarProps {
    workspaces: any[]
}

export function DashboardSidebar({ workspaces }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px] h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-6 w-6" />
            <span className="">OfferIQ</span>
          </Link>
        </div>
        
        <div className="p-4">
            <WorkspaceSwitcher workspaces={workspaces} />
        </div>

        <div className="flex-1 py-0">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-3 w-full",
                  pathname === item.href && "bg-secondary"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
