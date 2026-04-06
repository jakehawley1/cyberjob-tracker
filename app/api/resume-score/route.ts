import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { jobId, resumeText, jdText } = await req.json()

  if (!resumeText || !jdText) {
    return NextResponse.json({ error: 'Missing resumeText or jdText' }, { status: 400 })
  }

  const prompt = `You are an expert government cybersecurity hiring manager reviewing a resume against a job description.

JOB DESCRIPTION:
${jdText}

RESUME:
${resumeText}

Analyze how well this resume matches the job description. Consider:
1. Required qualifications met
2. Relevant keywords and frameworks mentioned (NIST, RMF, FISMA, GRC, etc.)
3. Experience alignment
4. Gaps or missing qualifications
5. Strengths that stand out for this specific role

Respond ONLY with a JSON object in this exact format (no markdown, no backticks):
{
  "score": <integer 0-100>,
  "feedback": "<3-5 sentences covering: overall fit, top 2 strengths, top 2 gaps, one specific suggestion to improve the resume for this role>"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    const score = Math.min(100, Math.max(0, Math.round(parsed.score)))
    const feedback = parsed.feedback || ''

    if (jobId) {
      const sb = supabaseAdmin()
      await sb.from('jobs').update({ match_score: score }).eq('id', jobId)
    }

    return NextResponse.json({ score, feedback })
  } catch (err) {
    console.error('Resume score error:', err)
    return NextResponse.json({ error: 'Scoring failed. Check your Anthropic API key.' }, { status: 500 })
  }
}
