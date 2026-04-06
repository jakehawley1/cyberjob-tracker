import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { text } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  const prompt = `You are a job posting parser. Extract structured data from the following job posting text.

JOB POSTING:
${text}

Respond ONLY with a JSON object in this exact format (no markdown, no backticks, no extra text):
{
  "title": "<job title>",
  "org": "<organization/employer name>",
  "location": "<city, state or Remote or Hybrid>",
  "salary": "<salary range or grade level if mentioned, empty string if not found>",
  "source": "<one of: governmentjobs.com, USAJobs, LinkedIn, Indeed, Agency site, Other>",
  "clearance": "<one of: none, preferred, required>",
  "tags": ["<tag1>", "<tag2>"],
  "url": "",
  "notes": "<1-2 sentence summary of the role and key requirements>"
}

For tags pick relevant ones from: compliance, GRC, NIST, RMF, FISMA, help desk, IT support, local gov, state gov, federal, cybersecurity, information assurance, audit, privacy, risk management, network, security operations, SOC, analyst, entry level, mid level, clearance OK. Max 6 tags.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse response')
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Parse job error:', err)
    return NextResponse.json({ error: 'Failed to parse. Check your Anthropic API key.' }, { status: 500 })
  }
}
