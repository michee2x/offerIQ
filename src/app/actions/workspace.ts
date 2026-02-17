'use server'

import { createAdminClient } from "@/utils/supabase/admin"
import { getSession } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getWorkspaces() {
  const session = await getSession()

  if (!session?.user?.email) {
    return []
  }

  const supabase = createAdminClient()

  // We assume user identifier is email for now or id if stable
  const userId = session.user.id || session.user.email

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId) // Manual filtering since RLS is bypassed by admin client
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }

  return workspaces
}

export async function getWorkspaceById(workspaceId: string) {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  const supabase = createAdminClient()
  const userId = session.user.id || session.user.email

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching workspace:', error)
    return null
  }

  return workspace
}

export async function createWorkspace(formData: FormData) {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }

  const supabase = createAdminClient()
  const name = formData.get('name') as string
  const userId = session.user.id || session.user.email

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name,
      user_id: userId
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    return { error: 'Failed to create workspace' }
  }

  revalidatePath('/dashboard')
  return { success: true, workspace: data }
}
