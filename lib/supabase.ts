import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function supabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
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
