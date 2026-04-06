import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { latex, jd, jobTitle } = await req.json()

  if (!latex || !jd) {
    return NextResponse.json({ error: 'Missing latex or jd' }, { status: 400 })
  }

  const prompt = `You are an expert resume writer specializing in government cybersecurity and IT compliance roles. You help candidates tailor their LaTeX resumes to specific job descriptions.

Your task: Rewrite the candidate's LaTeX resume to better match the job description below. 

RULES:
- NEVER fabricate experience, skills, certifications, or accomplishments the candidate does not already have
- DO reorder bullet points to lead with most relevant experience
- DO swap in exact keywords and phrases from the job description where they accurately describe the candidate's experience
- DO adjust the professional summary/objective to mirror the job's language
- DO emphasize relevant frameworks (NIST, RMF, FISMA, GRC, etc.) if they already appear in the resume
- DO reframe existing bullets to highlight aspects most relevant to this role
- Keep the same LaTeX structure and formatting commands — only change text content
- Keep all dates, employer names, degree names, and GPA exactly as-is
- Keep the overall length approximately the same

${jobTitle ? `JOB TITLE: ${jobTitle}` : ''}

JOB DESCRIPTION:
${jd}

CANDIDATE'S CURRENT LATEX RESUME:
${latex}

Respond with a JSON object in this exact format (no markdown, no backticks):
{
  "latex": "<the complete rewritten LaTeX code>",
  "feedback": "<4-6 sentences explaining exactly what you changed and why — be specific about which bullets were reworded, what keywords were added, and what was reordered>"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Find JSON in response — Claude sometimes adds text before/after
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse response')
    
    const parsed = JSON.parse(jsonMatch[0])
    
    return NextResponse.json({
      latex: parsed.latex || '',
      feedback: parsed.feedback || ''
    })
  } catch (err) {
    console.error('Resume tailor error:', err)
    return NextResponse.json({ error: 'Tailoring failed. Check your Anthropic API key and try again.' }, { status: 500 })
  }
}
