"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function WorkspaceHeader({ workspaceName }: { workspaceName?: string }) {
  const pathname = usePathname()
  
  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    if (segments[0] === 'workspace' && segments[1]) {
      breadcrumbs.push({ label: 'Workspaces', href: '/dashboard' })
      breadcrumbs.push({ label: workspaceName || 'Workspace', href: `/workspace/${segments[1]}` })
      
      if (segments[2]) {
        const pageName = segments[2].split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        breadcrumbs.push({ label: pageName, href: pathname })
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        {breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Link 
                  href={crumb.href}
                  className={index === breadcrumbs.length - 1 
                    ? "font-semibold" 
                    : "text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-semibold">Dashboard</h1>
        )}
      </div>
      <ModeToggle />
      {/* Placeholder for UserNav */}
      <div className="h-8 w-8 rounded-full bg-primary/10" />
    </header>
  )
}
