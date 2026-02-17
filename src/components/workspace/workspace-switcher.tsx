"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CreateWorkspaceDialog } from "./create-workspace-dialog"

interface Workspace {
    id: string
    name: string
}

interface WorkspaceSwitcherProps {
    workspaces: Workspace[]
}

export function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  
  // Get active workspace from localStorage
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace | null>(() => {
    if (typeof window !== 'undefined') {
      const activeId = localStorage.getItem("activeWorkspaceId")
      return workspaces.find(w => w.id === activeId) || workspaces[0] || null
    }
    return workspaces[0] || null
  })

  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace)
    localStorage.setItem("activeWorkspaceId", workspace.id)
    setOpen(false)
    // Navigate to workspace dashboard
    router.push(`/workspace/${workspace.id}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedWorkspace ? (
             <span className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 shrink-0 opacity-50" />
                {selectedWorkspace.name}
             </span>
          ) : (
            "Select Workspace..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={workspace.name}
                  onSelect={() => handleSelectWorkspace(workspace)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {workspace.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <div className="p-2">
            <CreateWorkspaceDialog />
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
