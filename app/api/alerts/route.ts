import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/alerts — send a digest of recent applications or a status change alert
export async function POST(req: NextRequest) {
  const { type, jobId } = await req.json()
  const email = process.env.ALERT_EMAIL

  if (!email) return NextResponse.json({ error: 'ALERT_EMAIL not set' }, { status: 500 })

  const sb = supabaseAdmin()

  if (type === 'digest') {
    // Weekly digest: all active jobs
    const { data: jobs } = await sb
      .from('jobs')
      .select('*')
      .not('status', 'in', '("rejected","withdrawn")')
      .order('created_at', { ascending: false })

    const rows = (jobs || []).map(j => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.org}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.status}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.date_applied || '—'}</td>
      </tr>`).join('')

    const html = `
      <h2 style="font-family:sans-serif">CyberJob Tracker — Weekly Digest</h2>
      <p style="font-family:sans-serif;color:#666">You have ${jobs?.length || 0} active applications.</p>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px 12px;text-align:left">Title</th>
            <th style="padding:8px 12px;text-align:left">Organization</th>
            <th style="padding:8px 12px;text-align:left">Status</th>
            <th style="padding:8px 12px;text-align:left">Applied</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-family:sans-serif;color:#999;font-size:12px;margin-top:24px">Sent by your CyberJob Tracker</p>
    `

    await resend.emails.send({
      from: 'CyberJob Tracker <onboarding@resend.dev>',
      to: email,
      subject: `CyberJob Tracker — ${jobs?.length || 0} active applications`,
      html,
    })

    return NextResponse.json({ ok: true, sent: jobs?.length })
  }

  if (type === 'status' && jobId) {
    // Status change alert for a specific job
    const { data: job } = await sb.from('jobs').select('*').eq('id', jobId).single()
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const html = `
      <h2 style="font-family:sans-serif">Status update: ${job.title}</h2>
      <p style="font-family:sans-serif;color:#333">
        <strong>${job.org}</strong>${job.location ? ` · ${job.location}` : ''}<br/>
        Status changed to: <strong>${job.status.toUpperCase()}</strong>
      </p>
      ${job.notes ? `<p style="font-family:sans-serif;color:#666;font-size:14px">${job.notes}</p>` : ''}
      <p style="font-family:sans-serif;color:#999;font-size:12px;margin-top:24px">Sent by your CyberJob Tracker</p>
    `

    await resend.emails.send({
      from: 'CyberJob Tracker <onboarding@resend.dev>',
      to: email,
      subject: `[${job.status.toUpperCase()}] ${job.title} — ${job.org}`,
      html,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown alert type' }, { status: 400 })
}

// GET /api/alerts — trigger a digest (can be called by a cron job)
export async function GET() {
  const req = new NextRequest('http://localhost/api/alerts', {
    method: 'POST',
    body: JSON.stringify({ type: 'digest' }),
    headers: { 'Content-Type': 'application/json' }
  })
  return POST(req)
}
