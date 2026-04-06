import { createClient } from '@supabase/supabase-js'

export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing (anon)')
  return createClient(url, key)
}

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing (service role)')
  return createClient(url, key)
}

export type Job = {
  id: string
  title: string
  org: string
  location: string
  salary: string
  source: string
  url: string
  date_applied: string
  status: 'applied' | 'interview' | 'finalist' | 'offer' | 'rejected' | 'withdrawn' | 'pending'
  clearance: 'none' | 'preferred' | 'required'
  tags: string[]
  notes: string
  resume_version: string
  match_score: number | null
  created_at: string
  timeline: { status: string; date: string; note?: string }[]
}
