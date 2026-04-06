import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = supabaseAdmin()
  const { data, error } = await sb.from('jobs').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const sb = supabaseAdmin()
  const body = await req.json()
  const { data, error } = await sb.from('jobs').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const sb = supabaseAdmin()
  const body = await req.json()
  const { id, ...updates } = body
  const { data, error } = await sb.from('jobs').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const sb = supabaseAdmin()
  const { id } = await req.json()
  const { error } = await sb.from('jobs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
