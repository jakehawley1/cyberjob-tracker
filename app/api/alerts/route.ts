import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { type, jobId } = await req.json()
  const email = process.env.ALERT_EMAIL
  if (!email) return NextResponse.json({ error: 'ALERT_EMAIL not set' }, { status: 500 })

  const sb = supabaseAdmin()

  if (type === 'digest') {
    const { data: jobs } = await sb.from('jobs').select('*').not('status', 'in', '("rejected","withdrawn")').order('created_at', { ascending: false })
    const rows = (jobs || []).map(j => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.title}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.org}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.status}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.date_applied || '—'}</td></tr>`).join('')
    const html = `<h2 style="font-family:sans-serif">CyberJob Tracker — Weekly Digest</h2><p style="font-family:sans-serif;color:#666">You have ${jobs?.length || 0} active applications.</p><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px"><thead><tr style="background:#f5f5f5"><th style="padding:8px 12px;text-align:left">Title</th><th style="padding:8px 12px;text-align:left">Organization</th><th style="padding:8px 12px;text-align:left">Status</th><th style="padding:8px 12px;text-align:left">Applied</th></tr></thead><tbody>${rows}</tbody></table>`
    await resend.emails.send({ from: 'CyberJob Tracker <onboarding@resend.dev>', to: email, subject: `CyberJob Tracker — ${jobs?.length || 0} active applications`, html })
    return NextResponse.json({ ok: true, sent: jobs?.length })
  }

  if (type === 'status' && jobId) {
    const { data: job } = await sb.from('jobs').select('*').eq('id', jobId).single()
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    const html = `<h2 style="font-family:sans-serif">Status update: ${job.title}</h2><p style="font-family:sans-serif;color:#333"><strong>${job.org}</strong><br/>Status: <strong>${job.status.toUpperCase()}</strong></p>`
    await resend.emails.send({ from: 'CyberJob Tracker <onboarding@resend.dev>', to: email, subject: `[${job.status.toUpperCase()}] ${job.title} — ${job.org}`, html })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown alert type' }, { status: 400 })
}

export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const email = process.env.ALERT_EMAIL
  if (!email) return NextResponse.json({ error: 'ALERT_EMAIL not set' }, { status: 500 })
  const sb = supabaseAdmin()
  const { data: jobs } = await sb.from('jobs').select('*').not('status', 'in', '("rejected","withdrawn")').order('created_at', { ascending: false })
  const rows = (jobs || []).map(j => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.title}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.org}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.status}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${j.date_applied || '—'}</td></tr>`).join('')
  const html = `<h2 style="font-family:sans-serif">CyberJob Tracker — Weekly Digest</h2><p style="font-family:sans-serif;color:#666">You have ${jobs?.length || 0} active applications.</p><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px"><thead><tr style="background:#f5f5f5"><th style="padding:8px 12px;text-align:left">Title</th><th style="padding:8px 12px;text-align:left">Organization</th><th style="padding:8px 12px;text-align:left">Status</th><th style="padding:8px 12px;text-align:left">Applied</th></tr></thead><tbody>${rows}</tbody></table>`
  await resend.emails.send({ from: 'CyberJob Tracker <onboarding@resend.dev>', to: email, subject: `CyberJob Tracker — ${jobs?.length || 0} active applications`, html })
  return NextResponse.json({ ok: true, sent: jobs?.length })
}
