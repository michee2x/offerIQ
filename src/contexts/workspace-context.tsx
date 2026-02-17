"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Workspace {
  id: string
  name: string
  user_id: string
  created_at: string
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (workspace: Workspace | null) => void
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load workspace from localStorage on mount
    const savedWorkspaceId = localStorage.getItem('activeWorkspaceId')
    if (savedWorkspaceId) {
      // In a real app, fetch workspace details from API
      // For now, we'll just store the ID
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSetWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspace(workspace)
    if (workspace) {
      localStorage.setItem('activeWorkspaceId', workspace.id)
    } else {
      localStorage.removeItem('activeWorkspaceId')
    }
  }

  return (
    <WorkspaceContext.Provider 
      value={{ 
        currentWorkspace, 
        setCurrentWorkspace: handleSetWorkspace,
        isLoading 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
